interface JsonSource {
    json: () => Promise<unknown>;
}

export const parseRequestJsonSafe = async <T = unknown>(source: JsonSource): Promise<T | null> => {
    try {
        return (await source.json()) as T;
    } catch {
        return null;
    }
};
