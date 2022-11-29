
export function postImage(file: File): Promise<{ public_id: string; }> {
    const fd = new FormData();

    fd.append('upload_preset', '3board');
    fd.append('file', file);

    return fetch('https://api.cloudinary.com/v1_1/dvn0uqwwl/upload', {
        body: fd,
        method: 'POST'
    }).then(x => x.json());
}
