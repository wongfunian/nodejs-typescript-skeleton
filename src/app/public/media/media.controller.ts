import { Request, Response } from 'express';
import * as mediaService from './media.service';

export const getMedia = async (req: Request, res: Response) => {
    const response = await mediaService.getMedia(req.params.key);

    if (response.attachment) {
        return res.attachment(response.media.name);
    }

    res.setHeader('Content-disposition', 'inline; filename="' + response.media.name + '"');
    res.setHeader('Content-type', response.media.type);
    (response.fileStream.Body as any).pipe(res);
};

export const downloadMedia = async (req: Request, res: Response) => {
    const response = await mediaService.getMedia(req.params.key);

    res.attachment(response.media.name);
    // const stream = response.fileStream!.Body!.transformToWebStream()
    (response.fileStream.Body as any).pipe(res);
};
