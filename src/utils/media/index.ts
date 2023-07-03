import 'dotenv/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Media } from '../../types';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
    },
});

// # Uploads a file to S3
export const uploadFile = async (file: Media) => {
    const Key = env + '/' + keyGenerator(file.originalname);

    const uploadParams = {
        Bucket: bucketName as string,
        Body: file.buffer,
        Key,
    };

    const putCommand = new PutObjectCommand(uploadParams);

    const test = await s3.send(putCommand);

    return Key;
};

// # Check is object exist
const isObjectExists = async ({ Key, Bucket }: { Key: string; Bucket: string }) => {
    try {
        const headObjectCommand = new HeadObjectCommand({
            Bucket,
            Key: env + '/' + Key,
        });
        const result = await s3.send(headObjectCommand);

        return result;
    } catch (error) {
        return false;
    }
};

// # downloads a file from S3
export const getFileStream = async (key: string) => {
    const downloadParams = {
        Key: env + '/' + key,
        Bucket: bucketName as string,
    };

    const getCommand = new GetObjectCommand(downloadParams);
    const result = await s3.send(getCommand);

    if (!result.Body) {
        return false;
    }

    return result;
};

// # Delete a file from S3
export const deleteFile = async (fileKey: string) => {
    const deleteParams = {
        Bucket: bucketName as string,
        Key: env + '/' + fileKey,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);

    const result = await s3.send(deleteCommand);

    return result;
};

// # Backup Database
export const backupDB = async (filePath: string) => {
    const fileStream = fs.createReadStream(filePath);
    const backupParams = {
        Bucket: bucketName as string,
        Body: fileStream,
        Key: 'backup/' + dayjs().format('YYYY-MM-DD') + '.sql',
    };

    const putCommand = new PutObjectCommand(backupParams);

    const result = await s3.send(putCommand);

    const oneMonthOldDataParams = {
        Key: 'backup/' + dayjs().subtract(1, 'months').format('YYYY-MM-DD') + '.sql',
        Bucket: bucketName as string,
    };
    const exist = await isObjectExists(oneMonthOldDataParams);

    if (exist) {
        console.log('Found 1 month old backup, deleting...');
        const deleteCommand = new DeleteObjectCommand(oneMonthOldDataParams);
        await s3.send(deleteCommand);
        console.log('Deleted 1 month old backup');
    }

    return result;
};

const keyGenerator = (fileName: string) => {
    const extension = fileName.split('.').pop();
    const key = `${dayjs().valueOf()}-${uuidv4()}.${extension}`;

    return key;
};
