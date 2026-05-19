import React, { useEffect, useRef } from 'react';

export default function Services({ setPage }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = `rgba(0, 242, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = (canvas.width * canvas.height) / 15000;
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const serviceList = [
    {
      id: 'tire',
      title: 'Flat Tire Repair',
      icon: 'tire_repair',
      desc: 'Rapid patch and reinflation or full spare installation on-site.',
      isPriority: false,
    },
    {
      id: 'battery',
      title: 'Battery Jumpstart',
      icon: 'battery_charging_full',
      desc: 'High-voltage surge delivery to instantly restore ignition systems.',
      isPriority: false,
    },
    {
      id: 'fuel',
      title: 'Fuel Delivery',
      icon: 'local_gas_station',
      desc: 'Emergency refueling for internal combustion and EV mobile charging.',
      isPriority: false,
    },
    {
      id: 'tow',
      title: 'Towing Service',
      icon: 'auto_towing',
      desc: 'Secure flatbed transport for severe immobilization scenarios.',
      isPriority: false,
    },
    {
      id: 'flood',
      title: 'Flood Rescue',
      icon: 'water_damage',
      desc: 'Specialized extraction from submerged or deep-water hazards.',
      isPriority: false,
    },
    {
      id: 'mud',
      title: 'Mud Rescue',
      icon: 'terrain',
      desc: 'Winch and heavy-duty extraction for off-road entanglements.',
      isPriority: false,
    },
    {
      id: 'engine',
      title: 'Engine Diagnostic',
      icon: 'build',
      desc: 'Mobile diagnostic and temporary fixes for critical mechanical failures.',
      isPriority: false,
    },
    {
      id: 'accident',
      title: 'Accident Support',
      icon: 'car_crash',
      desc: 'Priority dispatch for collision scene management and vehicle removal.',
      isPriority: true,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col">
      <canvas ref={canvasRef} className="particles-canvas" />

      <main className="flex-grow flex flex-col items-center justify-center py-12 px-6 md:px-10 w-full max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display-lg text-primary-container font-bold mb-4 neon-glow">
            Precision Rescue Solutions
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Immediate deployment. Expert resolution. Select your required service below for rapid dispatch of specialized units.
          </p>
        </section>

        {/* Services Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {serviceList.map((service) => {
            if (service.isPriority) {
              return (
                <div 
                  key={service.id} 
                  className="glass-panel rounded-xl p-6 glass-card-hover flex flex-col justify-between group relative overflow-hidden border-error/30 hover:border-error/60"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-error/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                  <div>
                    <span 
                      className="material-symbols-outlined text-4xl text-error mb-4 inline-block group-hover:scale-110 transition-transform duration-300 animate-pulse" 
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {service.icon}
                    </span>
                    <h3 className="font-title-md text-title-md text-error mb-2 font-bold">{service.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant/80 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                      {service.desc}
                    </p>
                  </div>
                  <button 
                    onClick={() => setPage('emergency')}
                    className="bg-error/20 border border-error text-error w-full py-3 rounded font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-error hover:text-on-error transition-all"
                  >
                    Deploy Priority Unit <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              );
            }

            return (
              <div 
                key={service.id} 
                className="glass-panel rounded-xl p-6 glass-card-hover flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                <div>
                  <span 
                    className="material-symbols-outlined text-4xl text-primary-fixed-dim mb-4 inline-block group-hover:scale-110 transition-transform duration-300"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {service.icon}
                  </span>
                  <h3 className="font-title-md text-title-md text-on-surface mb-2 font-bold">{service.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant/80 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                    {service.desc}
                  </p>
                </div>
                <button 
                  onClick={() => setPage('tracking')}
                  className="btn-ghost w-full py-3 rounded text-primary font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-primary-container/20"
                >
                  Deploy Unit <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
