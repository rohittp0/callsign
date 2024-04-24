"use client";

import Link from "next/link";

function Home() {

    return (
        <div className='container-fluid'>
            <Link href={'/sign'}>Sign</Link>
            <br/>
            <Link href={'/normal'}>Normal</Link>
        </div>
    )
}

export default Home;
