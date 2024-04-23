"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {DataConnection, Peer} from "peerjs";

export default function Normal() {
    const [connection, setConnection] = useState<DataConnection>();
    const videoRef = useRef<HTMLVideoElement>(null);

    function handleOnRecord() {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = async function(event: { results: { transcript: any; }[][]; }) {
            const transcript = event.results[event.results.length-1][0].transcript;
            console.log(transcript);
            if (connection) {
                connection.send(transcript);
            }
        }

        recognition.start();
    }

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
                });

            const connection = peer.connect("321");
            setConnection(connection);
        });

        return () => {
            peer.destroy();
        }
    }, [videoRef]);

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline/>
            <br />
            <Link href="/">End Call</Link>
        </div>
    )
}
