import { permissions } from '../../../data/department';
import { Media } from '../../../types';
import { getFileStream, uploadFile } from '../../../utils/media';
import prisma, { createSelect } from '../../../utils/prisma';
import mime from 'mime';
import { UserType } from '@prisma/client';

type UploadOptions = {
    userType: UserType;
    isPublic?: boolean;
    reference_table?: string;
    reference_id?: string;
    permission?: (typeof permissions)[number];
    uploadedBy?: string;
    userId?: string;
};

export const getMedia = async (key: string) => {
    const fileType = key.split('.')[1];
    const fileStream = await getFileStream(key);

    if (!fileStream) {
        throw {
            status: 404,
            message: 'message:Media not found',
        };
    }

    const media = await prisma.media.findFirst({
        where: {
            key,
            deletedAt: null,
        },
        select: createSelect(['id', 'name', 'type', 'key']),
    });

    if (!media) {
        throw {
            status: 404,
            message: 'messages:error.Media not found',
        };
    }

    if (mime.getType(fileType) === 'undefined' && !(mime.getType(fileType)!.split('/')[0] === 'image' || fileType === 'pdf')) {
        return {
            attachment: true,
            fileStream,
            media,
        };
    }

    return {
        fileStream,
        media,
    };
};

export const uploadMediaToS3 = async (mediaFile: Media, options: UploadOptions) => {
    const s3Response = await uploadFile(mediaFile);
    return {
        name: mediaFile.originalname,
        type: mime.getType(mediaFile.originalname.split('.')[mediaFile.originalname.split('.').length - 1]) ?? '',
        size: mediaFile.size,
        key: s3Response.split('/')[1],
        isPublic: options.isPublic ?? false,
        reference_table: options.reference_table ?? undefined,
        reference_id: options.reference_id ?? undefined,
        permission: options.permission ?? undefined,
        userType: options.userType,
        uploadedBy: options.uploadedBy ?? undefined,
        userId: options.userId ?? undefined,
    };
};
