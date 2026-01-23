"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Calendar, Check, Loader2 } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, linkWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { toast } from "sonner";
import { saveCalendarTokens } from "@/app/actions/calendar-sync";

export function CalendarConnect() {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false); // ideally fetch this initial state from server

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/calendar.events');
            provider.setCustomParameters({
                access_type: 'offline',
                prompt: 'consent'
            });

            // We use signInWithPopup to get credentials. 
            // If the user is already signed in, this acts as a re-auth/scope expansion.
            // linkWithPopup is better if we want to explicitly link, but signIn works for grabbing the credential.
            const result = await signInWithPopup(auth, provider);

            // Extract tokens
            // The credential object from Firebase result has the access token
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const accessToken = credential?.accessToken;

            // Firebase client SDK doesn't consistently expose the Refresh Token in the credential object 
            // in a way that is typed or guaranteed for 'offline' use with 'googleapis'.
            // However, result._tokenResponse.refreshToken often contains it if access_type=offline.
            // We'll attempt to grab it.
            // @ts-ignore
            const refreshToken = result._tokenResponse?.refreshToken;

            if (!accessToken) {
                throw new Error("No access token received");
            }

            // Save to server
            await saveCalendarTokens({
                accessToken,
                refreshToken // might be undefined if user already granted consent previously without prompt='consent'
            });

            setIsConnected(true);
            toast.success("Google Calendar connected successfully!");

        } catch (error: any) {
            console.error("Calendar connect error:", error);
            toast.error(error.message || "Failed to connect Google Calendar");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={isConnected ? "outline" : "default"}
            className={isConnected ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : ""}
            onClick={handleConnect}
            disabled={isLoading || isConnected}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isConnected ? (
                <Check className="w-4 h-4 mr-2" />
            ) : (
                <Calendar className="w-4 h-4 mr-2" />
            )}
            {isConnected ? "Calendar Synced" : "Connect Google Calendar"}
        </Button>
    );
}
