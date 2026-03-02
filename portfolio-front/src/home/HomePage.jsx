import Navbar from "../common/components/navbar/Navbar.jsx";
import Hero from "../home/hero/Hero.jsx";
import TechStack from "../home/techStack/TechStack.jsx";
import Contact from "../home/contact/Contact.jsx";


export default function HomePage() {
  return (
      <div className="app">
        <Navbar />

        <main>
          <Hero />
          <TechStack />
          <Contact />
        </main>
      </div>
  );
}