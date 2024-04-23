"use client";

import {useState} from "react";
import ActionModel from "@/app/components/ActionModel";
import Link from "next/link";

function Home() {

    const [text, setText] = useState('');

    return (
        <div className='container-fluid'>
            <Link href={'/sign'}>Sign</Link>
            <br/>
            <Link href={'/normal'}>Normal</Link>
        </div>
    )
}

export default Home;
