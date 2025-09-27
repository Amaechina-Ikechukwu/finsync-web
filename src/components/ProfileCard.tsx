import Image from "next/image";

export default function ProfileCard() {
  return (
    <div className="aspect-[4/5] w-full overflow-hidden">
      <Image
        src="/assets/pexel2.jpg"
        alt="Finsync User"
        width={640}
        height={800}
        className="object-cover w-full h-full select-none"
        priority
      />
    </div>
  );
}
