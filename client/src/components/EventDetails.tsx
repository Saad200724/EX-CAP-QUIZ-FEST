import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EventDetails() {
  const details = [
    {
      icon: Calendar,
      title: "Date",
      value: "October 14, 2025",
      subtitle: "Tuesday"
    },
    {
      icon: Clock,
      title: "Time",
      value: "10:45 AM - 2:30 PM",
      subtitle: "School: 10:45 AM - 2:30 PM | College: 10:45 AM - 2:00 PM"
    },
    {
      icon: MapPin,
      title: "Venue",
      value: "Savar Cantonment Public School & College",
      subtitle: "School Canteen & Parent Shed"
    }
  ];

  return (
    <section id="details" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-details-title">
            Event Details
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mark your calendar and get ready for an amazing day of intellectual challenges
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {details.map((detail, index) => {
            const IconComponent = detail.icon;
            return (
              <Card 
                key={index}
                className="relative group hover-elevate transition-all duration-300 hover:shadow-lg border-0 bg-card/80 backdrop-blur"
                data-testid={`card-detail-${detail.title.toLowerCase()}`}
              >
                <CardContent className="p-8 text-center">
                  {/* Icon with gradient background */}
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    {detail.title}
                  </h3>
                  
                  <p className="text-xl font-bold text-foreground mb-1" data-testid={`text-${detail.title.toLowerCase()}-value`}>
                    {detail.value}
                  </p>
                  
                  <p className="text-sm text-muted-foreground">
                    {detail.subtitle}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}