"use client";

import {useEffect, useMemo, useRef} from "react";
import Link from "next/link";
import {DataConnection, Peer} from "peerjs";

export default function Normal() {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleTranscription = useMemo(() => (connection: DataConnection) => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = async function(event: { results: { transcript: any; }[][]; }) {
            const transcript = event.results[event.results.length-1][0].transcript;
            console.log(transcript, connection);
            connection.send(transcript);
        }

        recognition.start();
    }, []);

    useEffect(() => {
        const peer = new Peer("123", {
            host: "localhost",
            port: 9000,
            path: "/",
        });

        peer.on("call", (call) => {
            navigator.mediaDevices.getUserMedia({video: true, audio: false})
                .then((stream) => {
                    call.answer(stream);
                    call.on("stream", (remoteStream: MediaProvider | null) => {
                        if (videoRef.current) {
                            videoRef.current.srcObject = remoteStream;
                        }
                    });
                    call.on("close", () => {
                        stream.getTracks().forEach(track => track.stop());
                    });
                });

            const connection = peer.connect("321");
            connection.on("open", () => handleTranscription(connection));
        });

        return () => {
            peer.destroy();
        }
    }, [handleTranscription, videoRef]);

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline/>
            <br />
            <Link href="/">End Call</Link>
        </div>
    )
}
