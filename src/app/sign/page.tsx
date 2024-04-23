"use client";

import {useRef, useState} from "react";
import Link from "next/link";
import {Peer} from "peerjs";
import ActionModel from "@/app/components/ActionModel";

export default function Sign() {
    const [text, setText] = useState('');
    const [started, setStarted] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    function startCall() {
        if(!window) return;

        const peer = new Peer("321", {
            host: "localhost",
            port: 9000,
            path: "/",
        });
        setStarted(true);

        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((stream) => {
                const call = peer.call("123", stream);
                call.on("stream", (remoteStream: MediaProvider | null) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = remoteStream;
                    }
                });
                call.on("close", () => {
                    setStarted(false);
                });
                call.on("error", console.log);
            });

        peer.on("error", console.log);

        peer.on("connection", (conn) => {
            conn.on("data", (data) => {
                console.log(data);
                setText(data as string);
            });
        });

        return () => {
            peer.destroy();
        }
    }

    return (
        <div>
            {!started && <button onClick={startCall}>Start Call</button>}
            <video ref={videoRef} autoPlay playsInline/>
            <ActionModel text={text} pause={400} speed={0.3} />
            <p>{text}</p>
            <br />
            <Link href="/">End Call</Link>
        </div>
    )
}
