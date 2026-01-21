"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

interface UseStorageResult {
    progress: number;
    error: string | null;
    url: string | null;
    uploadFile: (file: File, path: string) => Promise<string>;
}

export function useStorage(): UseStorageResult {
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState<string | null>(null);

    const uploadFile = async (file: File, path: string): Promise<string> => {
        setError(null);
        setUrl(null);
        setProgress(0);

        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progressPercentage);
                },
                (err) => {
                    setError(err.message);
                    reject(err);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setUrl(downloadURL);
                        resolve(downloadURL);
                    } catch (err: any) {
                        setError(err.message);
                        reject(err);
                    }
                }
            );
        });
    };

    return { progress, error, url, uploadFile };
}
