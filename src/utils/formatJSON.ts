export const formatJSON = (data: Buffer) => {
    if (data) {
        return JSON.parse(data.toString());
    }
};
