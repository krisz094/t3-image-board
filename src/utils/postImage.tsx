import axios from "axios";

export function postImage(file: File, onUploadProgress?: ({ progress }: { progress: number }) => void) {
    const url = 'https://api.cloudinary.com/v1_1/dvn0uqwwl/upload';
    const fd = new FormData();

    fd.append('upload_preset', '3board');
    fd.append('file', file);

    return axios.post<{ public_id: string; }>(url, fd, {
        onUploadProgress: onUploadProgress ? e => {
            onUploadProgress({ progress: e.progress || 0 });
        } : undefined
    });
}
