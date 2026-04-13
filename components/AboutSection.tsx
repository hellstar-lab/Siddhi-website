// Server Component — image URL resolved at request time, zero client waterfall
import { fetchFoodImageServer } from "@/lib/pexelsServer"
import AboutSectionClient from "./AboutSectionClient"

export default async function AboutSection() {
  const imgUrl = await fetchFoodImageServer("indian restaurant interior warm lights")

  return (
    <section id="about" className="py-20 px-4" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="max-w-6xl mx-auto">
        <AboutSectionClient imgUrl={imgUrl} />
      </div>
    </section>
  )
}
