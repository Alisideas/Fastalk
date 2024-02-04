import Image from "next/image";

const Logo = () => {
    return (
        <div className="flex flex-row gap-2 h-full items-center">
            <Image
                height={60}
                width={60}
                alt="logo"
                src="/logo.svg"
            />
            <h1 className="text-3xl font-bold font-mono text-sky-700">Fastalk</h1>
        </div>
    );
}

export default Logo;