export function BoardNameDesc({ name, desc }: { name?: string; desc?: string; }) {
    return <h1 className="font-sans font-bold text-red-800 text-3xl text-center w-full ">
        <span>/{name}/</span>
        {desc && <span> - </span>}
        <span>{desc}</span>
    </h1>;
}
