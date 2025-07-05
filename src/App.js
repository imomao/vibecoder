import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Github, Cpu, UserRound, Code, Crosshair, MapPin, MessageSquare } from 'lucide-react';

// --- Custom Hooks ---
const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: null, y: null });

    useEffect(() => {
        const mouseMoveHandler = (event) => {
            const { clientX, clientY } = event;
            setMousePosition({ x: clientX, y: clientY });
        };
        window.addEventListener('mousemove', mouseMoveHandler);
        return () => window.removeEventListener('mousemove', mouseMoveHandler);
    }, []);

    return mousePosition;
};

// --- Animation Components ---
const ScrambleText = ({ text }) => {
    const ref = useRef(null);
    // Removed `once: true` to allow the animation to re-trigger every time it enters the viewport.
    const isInView = useInView(ref, { amount: 0.5 });
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        if (isInView) {
            let interval;
            const chars = '!<>-_\\/[]{}—=+*^?#________';
            let iteration = 0;

            const scramble = () => {
                iteration += 1 / 3;
                const newText = text
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");
                setDisplayedText(newText);

                if (iteration >= text.length) {
                    clearInterval(interval);
                }
            };
            interval = setInterval(scramble, 30);
            return () => clearInterval(interval);
        } else {
            // Reset text when it's out of view to allow re-scrambling
            setDisplayedText("");
        }
    }, [isInView, text]);

    return <span ref={ref}>{displayedText}</span>;
};


// --- Main App Component ---
const App = () => {
    useEffect(() => {
        // Set the theme color for the browser UI (notification bar, etc.) on mobile
        let metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute('content', '#02040a');
    }, []);

    return (
        // Added overscroll-y-none to prevent "pull-to-refresh" and overscroll glow on mobile
        <div className="bg-[#02040a] text-gray-300 font-sans antialiased relative cursor-none overflow-x-hidden overscroll-y-none">
            <CustomCursor />
            <ParticleBackground />
            <div className="relative z-10">
                <main className="container mx-auto px-6 md:px-10 py-16 md:py-24">
                    <Header />
                    <div className="space-y-24 md:space-y-40 mt-24 md:mt-40">
                        <AboutMe />
                        <Skills />
                        <TechStack />
                        <RecentProjects />
                        <Philosophy />
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};


// --- UI Components ---

const CustomCursor = () => {
    const { x, y } = useMousePosition();
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);

        // Use a more specific selector to avoid issues
        const hoverables = document.querySelectorAll('a, button, [data-hover]');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            hoverables.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    const cursorVariants = {
        default: {
            x: x - 16,
            y: y - 16,
            width: 32,
            height: 32,
            backgroundColor: "rgba(255, 255, 255, 0)",
            border: "1px solid #00f6ff",
        },
        hover: {
            x: x - 24,
            y: y - 24,
            width: 48,
            height: 48,
            backgroundColor: "rgba(0, 246, 255, 0.1)",
            border: "1px solid #00f6ff",
        }
    };

    if (x === null) {
        return null;
    }

    return (
        <motion.div
            className="fixed top-0 left-0 rounded-full pointer-events-none z-50 hidden md:block"
            variants={cursorVariants}
            animate={isHovering ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
    );
};


const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const setCanvasDimensions = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasDimensions();

        let particlesArray;
        const isMobile = () => window.innerWidth < 768;

        const handleResize = () => {
            setCanvasDimensions();
            init();
        };
        window.addEventListener('resize', handleResize);

        class Particle {
            constructor(x, y, directionX, directionY, size) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = 'rgba(0, 246, 255, 0.3)';
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            const numberOfParticles = isMobile() ? 30 : 60; // Slightly increased mobile particles
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                particlesArray.push(new Particle(x, y, directionX, directionY, size));
            }
        }

        function connect() {
            // This function now draws lines on mobile, but with a smaller radius for performance.
            let opacityValue = 1;
            const connectionRadiusSquared = isMobile() ? (80 * 80) : (120 * 120);

            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distanceSquared = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                    
                    if (distanceSquared < connectionRadiusSquared) {
                        opacityValue = 1 - (distanceSquared / connectionRadiusSquared);
                        ctx.strokeStyle = `rgba(0, 246, 255, ${opacityValue * 0.3})`; // Lines are more subtle
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }

        init();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 opacity-40"></canvas>;
};

// Refactored AnimatedSection to use whileInView for more reliable mobile animations
const AnimatedSection = ({ children, id }) => {
    return (
        <motion.section
            id={id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
                visible: { transition: { staggerChildren: 0.2 } }
            }}
            className="space-y-8 py-8"
        >
            {children}
        </motion.section>
    );
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } }
};

const SectionTitle = ({ children, icon: Icon }) => (
    <motion.div className="flex items-center gap-4" variants={itemVariants}>
        <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            <Icon className="w-8 h-8 text-cyan-400" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
             <ScrambleText text={children} />
        </h2>
    </motion.div>
);

const Header = () => {
    const name = "OMA";
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);
    
    return (
        <motion.header 
            className="text-center space-y-4 min-h-[60vh] flex flex-col justify-center items-center"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.3 } }
            }}
        >
            <motion.h1 
                className={`text-[20vw] sm:text-8xl md:text-9xl font-extrabold tracking-tighter ${isMobile ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-cyan-400'}`}
                variants={itemVariants}
            >
                <span className="sr-only">{name}</span>
                <span aria-hidden>
                    {name.split("").map((char, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="inline-block"
                        >
                            {char}
                        </motion.span>
                    ))}
                </span>
            </motion.h1>
            <motion.p 
                className="text-lg md:text-xl text-gray-400 tracking-wide max-w-sm md:max-w-none"
                variants={itemVariants}
            >
                Vibe Coder | AI-Powered Developer | Prompt Engineer
            </motion.p>
            <motion.div 
                className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 pt-4 text-gray-400"
                variants={itemVariants}
            >
                <div className="flex items-center gap-2" data-hover>
                    <MapPin size={16} />
                    <span>Remote</span>
                </div>
                <a href="http://x.com/omabyte" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors" data-hover>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
                    </svg>
                    <span>omabyte</span>
                </a>
                <a href="https://github.com/imomao" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-cyan-400 transition-colors" data-hover>
                    <Github size={16} />
                    <span>imomao</span>
                </a>
            </motion.div>
        </motion.header>
    );
};

const AboutMe = () => (
    <AnimatedSection id="about">
         <motion.div className="bg-black/20 backdrop-blur-sm p-8 rounded-lg will-change-transform" variants={itemVariants}>
            <SectionTitle icon={UserRound}>About Me</SectionTitle>
            <motion.p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mt-6" variants={itemVariants}>
                i’m a vibe coder, a new breed of developer fluent in natural language prompts, fluent logic, and AI-augmented development. i specialize in using LLMs like GPT-4, Gemini, and Claude to generate, refine, and debug clean, scalable code across frontend, backend, and creative automation stacks. i don’t just write code, i shape intention into output. although i mostly vibe code to solve personal problems, i am always open to collaborating.
            </motion.p>
        </motion.div>
    </AnimatedSection>
);

const Skills = () => {
    const skillsList = [
        "Prompt Engineering", "Rapid Prototyping", "AI Code Review", "React & Next.js"
    ];
    return (
        <AnimatedSection id="skills">
            <motion.div className="bg-black/20 backdrop-blur-sm p-8 rounded-lg will-change-transform" variants={itemVariants}>
                <SectionTitle icon={Cpu}>Skills</SectionTitle>
                <motion.div className="flex flex-wrap gap-3 mt-6" variants={itemVariants}>
                    {skillsList.map((skill) => (
                        <motion.div
                            key={skill}
                            className="bg-gray-500/10 border border-gray-500/20 rounded-full px-4 py-2 text-gray-300 cursor-pointer"
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.05, color: '#00f6ff' }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            data-hover
                        >
                            {skill}
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </AnimatedSection>
    );
};

const TechStack = () => {
    const stacks = {
        "Languages": ["JavaScript", "TypeScript", "Python"],
        "Frameworks": ["React", "Next.js"],
        "AI Tools": ["GPT-4", "Gemini", "Claude"],
        "Cloud": ["Firebase", "Supabase", "Vercel", "Netlify"],
    };
    return (
        <AnimatedSection id="tech-stack">
             <motion.div className="bg-black/20 backdrop-blur-sm p-8 rounded-lg will-change-transform" variants={itemVariants}>
                <SectionTitle icon={Code}>Using</SectionTitle>
                <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-6" variants={itemVariants}>
                    {Object.entries(stacks).map(([category, tools]) => (
                        <motion.div key={category} className="space-y-3" variants={itemVariants}>
                            <h3 className="font-semibold text-cyan-400 border-b border-cyan-400/20 pb-2">{category}</h3>
                            <ul className="space-y-2 pt-2">
                                {tools.map(tool => (
                                    <motion.li 
                                        key={tool} 
                                        className="text-gray-400 transition-colors cursor-pointer" 
                                        data-hover
                                        whileHover={{ 
                                            scale: 1.1, 
                                            color: '#00f6ff',
                                            textShadow: "0px 0px 8px rgb(0,246,255)",
                                            originX: 0
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {tool}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </AnimatedSection>
    );
};

const RecentProjects = () => {
    const projects = [
        { 
            title: "Wrd", 
            subtitle: "The Bible, for the new gen", 
            description: "Reimagines the Bible by translating its text into authentic Gen-Z slang, making it more relatable and less intimidating.", 
            stack: "Gemini 2.5, HTML, CSS, JavaScript",
            link: "https://wrdverse.netlify.app"
        },
        { 
            title: "Spark", 
            subtitle: "AI-powered brainstorming partner", 
            description: "It acts as both a creative collaborator to generate new ideas and a critical debater to stress-test them, helping you refine your vision from every angle.", 
            stack: "Gemini 2.5, HTML, CSS, JavaScript, React",
            link: "https://sparkky.xyz"
        },
        { 
            title: "BetterPrompt", 
            subtitle: "Smart prompt generator", 
            description: "You give it a simple idea in plain English, and it automatically writes expert-level, detailed prompts for the best AI models, so you get much better results.", 
            stack: "Gemini 2.5, HTML, CSS, JavaScript",
            link: "https://betterprompts.netlify.app"
        },
        { 
            title: "Remnat", 
            subtitle: "Modern digital companion for natural wellness", 
            description: "A quick and trustworthy guide, offering simple, verified home remedies for everyday ailments, all neatly organized so you can find what you need right away.", 
            stack: "Gemini 2.5, React, JSX, Tailwind CSS",
            link: "https://remnat.online"
        },
        {
            title: "DupL1k8",
            subtitle: "Efficient client-side utility for cleaning text",
            description: "This lets you paste any list or block of text and instantly removes all the duplicate lines, giving you a clean list.",
            stack: "Gemini 2.5, HTML, CSS, JavaScript",
            link: "https://dupl1k8.netlify.app"
        },
        {
            title: "Stelo",
            subtitle: "Movie suggester",
            description: "A simple and fun movie discovery app that suggests random films based on your favorite genre.",
            stack: "Gemini 2.5, JSX",
            link: "https://stelo.online"
        }
    ];
    return (
        <AnimatedSection id="projects">
            <SectionTitle icon={Crosshair}>Vibe coded</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <motion.div
                        key={project.title}
                        className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col h-full backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10 will-change-transform"
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        data-hover
                    >
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold text-gray-100">{project.title}</h3>
                            <p className="text-cyan-400 font-medium mt-1">{project.subtitle}</p>
                            <p className="text-gray-400 mt-4">{project.description}</p>
                        </div>
                        
                        <div className="mt-auto pt-6">
                            <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-block bg-gray-700/50 hover:bg-cyan-400/20 text-gray-200 hover:text-cyan-300 transition-all duration-300 px-5 py-2 rounded-lg text-sm font-semibold"
                                data-hover
                            >
                                View
                            </a>
                             <p className="text-xs text-gray-500 font-mono pt-4 mt-4 border-t border-white/10">→ {project.stack}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </AnimatedSection>
    );
};

const Philosophy = () => (
    <AnimatedSection id="philosophy">
        <motion.div className="text-center max-w-3xl mx-auto space-y-6 bg-gray-900/40 p-8 md:p-12 rounded-lg border border-gray-500/20 backdrop-blur-md will-change-transform" variants={itemVariants}>
            <p className="text-2xl md:text-3xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
                This is Vibe Coding.
            </p>
            <div className="text-lg md:text-xl text-gray-300 space-y-4">
                <p>Where creation becomes conversation.</p>
                <p>A prompt well-written is a product half-built. The old grind of line-by-line? That’s legacy energy.&nbsp;</p>
                <p className="text-xl md:text-2xl font-semibold text-cyan-400">Natural language + AI = creative dev energy.&nbsp;</p>
            </div>
            <p className="text-sm text-gray-500 italic mt-8">
                and yes, this site was vibe-coded as well
            </p>
        </motion.div>
    </AnimatedSection>
);

const Footer = () => (
    <motion.footer 
        className="text-center py-16 mt-16 border-t border-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
    >
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <MessageSquare className="w-8 h-8 text-cyan-400" />
             <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">Let’s Build</h3>
        </div>
        <p className="text-gray-400 max-w-xl mx-auto">
            open to collabs.
        </p>
        <div className="mt-8 flex justify-center gap-6">
             <a href="http://x.com/omabyte" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors" data-hover>
                 <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
                </svg>
            </a>
            <a href="https://github.com/imomao" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors" data-hover>
                <Github size={24} />
            </a>
        </div>
         <p className="text-gray-600 text-sm mt-12">© 2025 OMA. All vibes reserved.</p>
    </motion.footer>
);

export default App;
