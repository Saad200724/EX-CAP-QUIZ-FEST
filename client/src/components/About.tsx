import eventBanner from '../../attached_assets/Ex-Cap Quiz Fest.jpg';

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
                <strong>Ex-Cap Quiz Fest 2025</strong> - The arena of quizzes, the battlefield of minds. If you want to be the champion of this battlefield, join us for this extraordinary competition presented by Edutune.
              </p>
              
              <p>
                The Ex-Cap Alumni Association of Savar Cantonment Public School & College is organizing "Ex-Cap Quiz Fest 2025". This quiz competition provides students with a unique opportunity to test their knowledge and intellectual capabilities across multiple disciplines.
              </p>
              
              <p>
                This will be an excellent platform for intellectual development, where students from elementary to higher secondary levels can showcase their knowledge, intelligence, and creativity in a competitive yet enriching environment.
              </p>
            </div>
          </div>

          {/* Event Banner */}
          <div className="relative lg:pl-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-xl rounded-2xl" />
              <img
                src={eventBanner}
                alt="Ex-Cap Quiz Fest 2025 Event Banner"
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