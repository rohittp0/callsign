"use client";

import {useEffect, useRef} from "react";

import words from '@/Animations/words';
import alphabets from '@/Animations/alphabets';
import {defaultPose} from '@/Animations/defaultPose';

import * as THREE from "three";
// @ts-ignore
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";


const SPEED = 0.1;
const PAUSE = 800;

function Home() {
    const componentRef = useRef<Record<string, any>>({});
    const {current: ref} = componentRef;

    function handleOnRecord() {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.onresult = async function(event: { results: { transcript: any; }[][]; }) {
            const transcript = event.results[0][0].transcript;
            sign(transcript);
        }

        recognition.start();
    }


    useEffect(() => {

        ref.flag = false;
        ref.pending = false;

        ref.animations = [];
        ref.characters = [];

        ref.scene = new THREE.Scene();
        ref.scene.background = new THREE.Color(0xdddddd);

        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 5, 5);
        ref.scene.add(spotLight);
        ref.renderer = new THREE.WebGLRenderer({antialias: true});

        ref.camera = new THREE.PerspectiveCamera(
            30,
            window.innerWidth * 0.57 / (window.innerHeight - 70),
            0.1,
            1000
        )
        ref.renderer.setSize(window.innerWidth * 0.57, window.innerHeight - 70);

        const canvas = document.getElementById("canvas");

        if (!canvas)
            return;

        canvas.innerHTML = "";
        canvas.appendChild(ref.renderer.domElement);

        ref.camera.position.z = 1.6;
        ref.camera.position.y = 1.4;

        let loader = new GLTFLoader();
        loader.load(
            "/xbot.glb",
            (gltf: { scene: { traverse: (arg0: (child: any) => void) => void; }; }) => {
                gltf.scene.traverse((child) => {
                    if (child.type === 'SkinnedMesh') {
                        child.frustumCulled = false;
                    }
                });
                ref.avatar = gltf.scene;
                ref.scene.add(ref.avatar);
                defaultPose(ref);
            },
            console.log
        );

    }, [ref]);

    ref.animate = () => {
        if (ref.animations.length === 0) {
            ref.pending = false;
            return;
        }
        requestAnimationFrame(ref.animate);
        if (ref.animations[0].length) {
            if (!ref.flag) {
                if (ref.animations[0][0] === 'add-text') {
                    ref.animations.shift();
                } else {
                    for (let i = 0; i < ref.animations[0].length;) {
                        let [boneName, action, axis, limit, sign] = ref.animations[0][i]
                        if (sign === "+" && ref.avatar.getObjectByName(boneName)[action][axis] < limit) {
                            ref.avatar.getObjectByName(boneName)[action][axis] += SPEED;
                            ref.avatar.getObjectByName(boneName)[action][axis] = Math.min(ref.avatar.getObjectByName(boneName)[action][axis], limit);
                            i++;
                        } else if (sign === "-" && ref.avatar.getObjectByName(boneName)[action][axis] > limit) {
                            ref.avatar.getObjectByName(boneName)[action][axis] -= SPEED;
                            ref.avatar.getObjectByName(boneName)[action][axis] = Math.max(ref.avatar.getObjectByName(boneName)[action][axis], limit);
                            i++;
                        } else {
                            ref.animations[0].splice(i, 1);
                        }
                    }
                }
            }
        } else {
            ref.flag = true;
            setTimeout(() => {
                ref.flag = false
            }, PAUSE);
            ref.animations.shift();
        }
        ref.renderer.render(ref.scene, ref.camera);
    }

    const sign = (text: string) => {
        const strWords = text.toUpperCase().split(' ');

        for (let word of strWords) {
            if (words[word]) {
                ref.animations.push(['add-text', word + ' ']);
                words[word](ref);

            } else {
                word.split('').forEach((ch, index) => {
                    if (index === word.length - 1)
                        ref.animations.push(['add-text', ch + ' ']);
                    else
                        ref.animations.push(['add-text', ch]);
                    alphabets[ch](ref);
                });
            }
        }
    }

    return (
        <div className='container-fluid'>
            <div className='row'>
                <button onClick={handleOnRecord} className='btn btn-primary w-100 btn-style'>
                    Start Listening
                </button>
            </div>
            <div className='col-md-7'>
                <div id='canvas'/>
            </div>
        </div>
    )
}

export default Home;
