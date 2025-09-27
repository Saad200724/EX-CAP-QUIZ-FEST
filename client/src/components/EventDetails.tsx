import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EventDetails() {
  const details = [
    {
      icon: Calendar,
      title: "Date",
      value: "October 14, 2025",
      valueShort: "Oct 14, 2025",
      subtitle: "Tuesday"
    },
    {
      icon: Clock,
      title: "Time",
      value: "Tiffin Period",
      valueShort: "Tiffin",
      subtitle: ""
    },
    {
      icon: MapPin,
      title: "Venue",
      value: "Savar Cantonment Public School & College",
      valueShort: "SCPSC",
      subtitle: ""
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

        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {details.map((detail, index) => {
            const IconComponent = detail.icon;
            return (
              <Card 
                key={index}
                className="relative group hover-elevate transition-all duration-300 hover:shadow-lg border-0 bg-card/80 backdrop-blur aspect-square"
                data-testid={`card-detail-${detail.title.toLowerCase()}`}
              >
                <CardContent className="p-4 sm:p-6 text-center flex flex-col justify-center h-full">
                  {/* Icon with gradient background */}
                  <div className="mx-auto w-10 h-10 sm:w-14 sm:h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Mobile: Hide title for date card, show for others */}
                    <h3 className={`text-xs sm:text-base lg:text-lg font-semibold text-muted-foreground mb-2 uppercase tracking-wider ${
                      detail.title === 'Date' ? 'hidden sm:block' : 'block'
                    }`}>
                      {detail.title}
                    </h3>
                    
                    {/* Mobile: Short text */}
                    <p className="block sm:hidden text-sm font-normal text-foreground mb-1 leading-tight" data-testid={`text-${detail.title.toLowerCase()}-value`}>
                      {detail.valueShort}
                    </p>
                    
                    {/* Desktop: Full text */}
                    <p className="hidden sm:block text-xl lg:text-2xl font-semibold text-foreground mb-1 leading-tight" data-testid={`text-${detail.title.toLowerCase()}-value`}>
                      {detail.value}
                    </p>
                    
                    {/* Mobile: Hide subtitle for date card, show for others on desktop */}
                    {detail.subtitle && (
                      <p className={`text-xs sm:text-base lg:text-lg font-medium text-muted-foreground ${
                        detail.title === 'Date' ? 'hidden sm:block' : 'block'
                      }`}>
                        {detail.subtitle}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}