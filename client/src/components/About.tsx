import quizIllustration from '@assets/generated_images/Quiz_competition_educational_illustration_207650fd.png';

export default function About() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="lg:pr-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8" data-testid="text-about-title">
              About the Event
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p data-testid="text-about-description">
                Ex-Cap Quiz Fest 2025 brings together the brightest minds from universities across the region for an intellectually stimulating competition that celebrates academic excellence and knowledge sharing.
              </p>
              
              <p>
                This prestigious event features multiple rounds of challenging questions spanning various disciplines, from science and technology to arts and humanities, designed to test participants' breadth of knowledge and quick thinking abilities.
              </p>
              
              <p>
                Join us for an unforgettable experience where learning meets competition, networking opportunities abound, and the next generation of leaders showcase their intellectual prowess.
              </p>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative lg:pl-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-xl rounded-2xl" />
              <img
                src={quizIllustration}
                alt="Students participating in quiz competition"
                className="relative w-full h-auto rounded-2xl shadow-lg"
                data-testid="img-about-illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}