import Image from "next/image";

const team = [
  {
    name: "Lucca Reichborn",
    role: "Co-Founder",
    image: null,
    bio: null,
  },
  {
    name: "Zach Agranovich",
    role: "Co-Founder",
    image: "/images/zach-agranovich.png",
    bio: null,
  },
];

export default function OurTeam() {
  return (
    <section id="team" className="py-12 md:py-16 bg-[#f8fafc] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-6 md:mb-8 tracking-tight border-b border-[var(--foreground)]/10 pb-3">
          Our Team
        </h2>
        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center">
              <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-3 border border-gray-200">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={144}
                    height={144}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <svg className="w-14 h-14 text-[var(--foreground)]/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <h3 className="font-serif text-xl font-semibold text-[var(--foreground)]">{member.name}</h3>
              <p className="text-[var(--accent)] font-medium mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
