
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function CompetitionDetails() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const categories = [
    {
      icon: BookOpen,
      title: "Class 3-5",
      subjects: ["General Knowledge", "History", "Sports"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Class 6-8", 
      subjects: ["General Knowledge", "Math", "History", "Entertainment", "Sports"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BookOpen,
      title: "Class 9-10",
      subjects: ["IQ", "General Knowledge", "Math", "History", "Entertainment", "Sports"],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: BookOpen,
      title: "Class 11-12",
      subjects: ["IQ", "General Knowledge", "Math", "History", "Entertainment", "Sports"],
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Competition Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The competition is organized into four categories based on grade levels, each with carefully curated subjects to challenge and inspire students.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isExpanded = expandedCard === index;
            
            return (
              <Card 
                key={index} 
                className={`relative group hover-elevate transition-all duration-500 hover:shadow-lg border-0 bg-card/80 backdrop-blur overflow-hidden cursor-pointer ${
                  isExpanded ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                onMouseEnter={() => setExpandedCard(index)}
                onMouseLeave={() => setExpandedCard(null)}
                onClick={() => setExpandedCard(isExpanded ? null : index)}
              >
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${category.color}`} />
                
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {category.title}
                  </CardTitle>
                </CardHeader>

                <CardContent 
                  className={`pt-0 transition-all duration-500 overflow-hidden ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="space-y-2">
                    {category.subjects.map((subject, subIndex) => (
                      <div
                        key={subIndex}
                        className="px-3 py-2 bg-muted rounded-lg text-sm font-medium text-muted-foreground text-center transform transition-transform duration-300"
                        style={{
                          transitionDelay: `${subIndex * 50}ms`
                        }}
                      >
                        {subject}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Important Information
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-semibold text-primary mb-2">Registration</div>
              <div className="text-muted-foreground">Completely FREE</div>
            </div>
            <div>
              <div className="font-semibold text-primary mb-2">Mode</div>
              <div className="text-muted-foreground">Offline Competition</div>
            </div>
            <div>
              <div className="font-semibold text-primary mb-2">Eligibility</div>
              <div className="text-muted-foreground">Current students of Savar Cantonment Public School & College only</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
