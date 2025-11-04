import React from "react";
import HeadshotImage from "../assets/headshot.png";
import YextLogoImage from "../assets/yext_logo.png";
import VTLogoImage from "../assets/vt_logo.png";
import CapitalOneLogo from "../assets/capital_one_logo.png"
import PragmaticsLogo from "../assets/pragmatics_logo.png"
import TJLogo from "../assets/tjhsst_logo.png"
import { FaComputer, FaGears } from "react-icons/fa6";
import { IoSchool } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { IoCodeSlash } from "react-icons/io5";
import { LuMapPin } from "react-icons/lu";
import { IoLogoLinkedin } from "react-icons/io5";
import { FaGithub, FaRegBuilding } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { externalRoutes, pageRoutes } from "../utils/urls";
import { FadeSlideIn } from "../utils/animations";


const AboutMe = () => {
    return (
        <FadeSlideIn>
            <div className="min-h-screen flex flex-col gap-16 md:gap-24 items-center pt-8 px-4">
                <div className="flex flex-col items-center gap-6 overflow-wrap">
                    <Title />
                    <div className="flex flex-col md:flex-row gap-8 max-w-4xl items-center md:items-start">
                        <img
                            src={HeadshotImage}
                            alt="Headshot"
                            className="w-96 h-128 object-cover rounded-xl"
                        />
                        <div className="flex flex-col justify-start">
                            <span className="text-5xl font-semibold text-text-base">About Me</span>
                            <hr className="my-4 border-brd-muted" />
                            <AboutMeBlurb />
                            <SkillsSection />
                            <LinkButtonsSection />
                        </div>
                    </div>
                </div>
                <Timeline />
                <ExperienceSection />
                <WebsiteBlurbSection />
            </div>
        </FadeSlideIn>
    );
}


const Title = () => {
    return (
        <h1 className="text-8xl font-extrabold text-text-base mb-4">Hi! I'm <span className="text-primary-highlight">Kyle</span></h1>
    );
}

const AboutMeBlurb = () => {
    return (
        <div className="max-w-4xl text-text-base text-lg">
            <span className="italic text-primary-highlight text-xl mb-2 block">At a glance</span>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>
                    <FaComputer className="inline w-5 h-5 mb-1 mr-2 text-primary-highlight" />
                    <span className="font-semibold text-primary-base">Software engineer @</span>
                    <a
                        href={externalRoutes.Yext}
                        className="font-semibold text-primary-base underline-offset-4 transition-all duration-400 underline hover:scale-105 inline-block origin-left pr-1"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Yext
                    </a>
                    <span> based in </span>
                    <LuMapPin className="inline w-5 h-5 mb-1 text-primary-highlight" />
                    <span>Arlington, VA </span>
                </li>
                <li>
                    <IoSchool className="inline w-5 h-5 mb-1 mr-2 text-primary-highlight" />
                    <span className="font-semibold text-primary-base">Virginia Tech Computer Science graduate</span>
                    <span> (Fall 2021) - ΦΒΚ </span>
                    <a
                        href={externalRoutes.PhiBetaKappa}
                        className="font-semibold text-primary-base underline-offset-4 transition-all duration-400 underline hover:scale-105 inline-block origin-left"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Phi Beta Kappa
                    </a>
                </li>
                <li>
                    <FaGears className="inline w-5 h-5 mb-1 mr-2 text-primary-highlight" />Strong background in <span className="font-semibold text-primary-base">backend development</span>
                </li>
                <li>
                    <IoCodeSlash className="inline w-5 h-5 mb-1 mr-2 text-primary-highlight" />Rapidly expanding <span className="font-semibold text-primary-base">frontend development</span> skills
                </li>
            </ul>
        </div>
    );
}


const WebsiteBlurbSection = () => {
    return (
        <div className="text-text-base bg-background-muted rounded-lg p-4 shadow mb-4 text-lg">
            <p className="mb-2">
                This website showcases some of my projects where I've developed
                <a
                    href={pageRoutes.GameHome}
                    className="font-semibold text-primary-highlight underline-offset-4 transition-all duration-400 underline hover:scale-105 inline-block px-2"
                >
                    AI solutions
                </a>
                for some popular games. Please take a look around!
            </p>
            <p>
                <span className="font-semibold text-primary-highlight">Don't hesitate to reach out</span> if you'd like to connect or learn more about my work!
            </p>
        </div>
    );
}


const LinkButtonsSection = () => {
    return (
        <div className="flex flex-row justify-between items-center px-12 gap-3 text-xl text-text-base w-full max-w-lg mx-auto">
            <LinkButton
                href={externalRoutes.GitHub}
                icon={<FaGithub className="w-16 h-16" />}
            />
            <LinkButton
                href={externalRoutes.LinkedIn}
                icon={<IoLogoLinkedin className="w-16 h-16" />}
            />
            <LinkButton
                href={externalRoutes.Email}
                icon={<MdEmail className="w-16 h-16" />}
            />
        </div>
    );
}


const SkillsSection = () => {
    const skills = [
        "Java",
        "Python",
        "SQL",
        "TypeScript",
        "React",
        "TailwindCSS",
        "ElasticSearch",
        "Snowflake",
        "Go",
        "Kafka",
        "RabbitMQ",
        "GitHub",
        "Bazel",
    ];
    return (
        <div className="text-primary-highlight">
            <div className="flex flex-wrap gap-3 mb-4">
                {skills.map(skill => (
                    <span
                        key={skill}
                        className="px-4 py-2 rounded-full bg-background-muted shadow text-base font-semibold border border-brd-muted hover:scale-110 transition-transform duration-200 select-none cursor-not-allowed"
                    >
                        {skill}
                    </span>
                ))}
            </div>
            <hr className="my-4 border-brd-muted" />
        </div>
    );
}


const Timeline = () => {
    return (
        <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-text-base text-center pb-8 lg:pb-0">Career Timeline</h2>
            <div className="-ml-20 md:-ml-0">
                <ul className="timeline timeline-vertical lg:timeline-horizontal text-text-base">
                    <TimelineItem
                        date={2018}
                        icon={<IoSchool className="w-8 h-8" />}
                        label="Graduated from TJHSST"
                        scrollToId="tjhsst-experience-card"
                    />
                    <TimelineItem
                        date="Summer 2020"
                        icon={<FaRegBuilding className="w-8 h-8" />}
                        label="SWE Intern @ Pragmatics"
                        scrollToId="pragmatics-experience-card"
                    />
                    <TimelineItem
                        date="Summer 2021"
                        icon={<FaRegBuilding className="w-8 h-8" />}
                        label="SWE Intern @ Capital One"
                        scrollToId="capital-one-experience-card"
                    />
                    <TimelineItem
                        date="Dec. 2021"
                        icon={<IoSchool className="w-8 h-8" />}
                        label="Graduated from VT"
                        scrollToId="vt-experience-card"
                    />
                    <TimelineItem
                        date={2022}
                        icon={<FaRegBuilding className="w-8 h-8" />}
                        label="Started SWE @ Yext"
                        scrollToId="yext-experience-card"
                    />
                    <li>
                        <hr className="border-none bg-primary-base h-8 mx-auto lg:h-0.5" />
                        <div className="timeline-middle">
                            <IoIosArrowDown className="block lg:hidden w-8 h-8 text-primary-base -mt-5" />
                            <IoIosArrowForward className="hidden lg:block w-8 h-8 -ml-5 text-primary-base" />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}

interface TimelineItemProps {
    date: string | number;
    label: React.ReactNode | string;
    icon: React.ReactNode;
    scrollToId?: string;
}


const TimelineItem: React.FC<TimelineItemProps> = ({ date, icon, label, scrollToId }) => {
    return (
        <li>
            <hr className="border-none bg-primary-base h-8 mx-auto lg:h-0.5" />
            <div className="timeline-start">{date}</div>
            <div className="timeline-middle">{icon}</div>
            <div className="timeline-end timeline-box bg-background-muted flex flex-col items-center border-none">
                <span className="text-sm pb-1 text-center">{label}</span>
                <button
                    className="rounded-full hover:bg-primary-highlight hover:text-background-base transition-all duration-300"
                    // onClick={() => setShowInfo(true)}
                    onClick={() => {
                        if (!scrollToId) {
                            return;
                        }
                        const el = document.getElementById(scrollToId);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    <div className="rounded-full border border-text-base px-8 py-1 transition-all hover:text-background-base hover:border-primary-highlight">
                        {/* <FaInfo className="w-4 h-4" /> */}
                        <span className="text-xs font-semibold">Learn More</span>
                    </div>
                </button>
            </div>
            <hr className="border-none bg-primary-base h-8 mx-auto lg:h-0.5" />
        </li>
    );
}

const ExperienceSection = () => {
    return (
        <div className="max-w-4xl flex flex-col gap-4">
            <div id="yext-experience-card" className="flex flex-row bg-background-muted shadow-sm rounded-lg scroll-mt-24">
                <figure className="hidden md:flex w-full basis-1/4 justify-center items-center p-6">
                    <img
                        src={YextLogoImage}
                        alt="Yext Logo"
                        className="rounded-xl"
                    />
                </figure>
                <div className="text-text-base p-6 flex flex-col gap-2 text-sm md:basis-3/4">
                    <div className="flex flex-row gap-2 items-center">
                        <FaRegBuilding className="text-text-base w-6 h-6 hidden md:flex" />
                        <h2 className="card-title text-primary-highlight font-semibold text-xl">
                            Full Stack Software Engineer @ Yext
                        </h2>
                    </div>
                    <span className="text-sm italic">2022 – Present</span>
                    <p>
                        As a Full Stack Software Engineer at Yext, I primarily work on our
                        <span className="font-semibold text-primary-highlight"> Search </span>
                        product, building scalable backend services (Java, Go) and intuitive frontend interfaces (React, TypeScript).
                        I also mentored new hires and interns, taking on a leadership role within the team.
                    </p>
                    <p>
                        <span className="font-semibold text-primary-highlight pr-1">Backend:</span>
                        Improve search algorithms using Natural Language Processing (NLP), semantic similarity, and Generative AI (LLMs). Integrate analytics and observability with Grafana and Snowflake.
                    </p>
                    <p>
                        <span className="font-semibold text-primary-highlight pr-1">Frontend:</span>
                        Develop responsive, accessible UI components for configuring and managing search experiences.
                    </p>
                    <span className="font-semibold text-primary-highlight pr-1">Key Technologies:</span>
                    <ul className="list-disc pl-5">
                        <li>Java, Go, Python</li>
                        <li>React, TypeScript, TailwindCSS</li>
                        <li>Kafka & RabbitMQ</li>
                        <li>Snowflake, MySQL, ElasticSearch</li>
                        <li>Grafana</li>
                    </ul>
                </div>
            </div>
            <div id="vt-experience-card" className="flex flex-row bg-background-muted shadow-sm rounded-lg scroll-mt-24">
                <figure className="hidden md:flex w-full basis-1/4 justify-center items-center p-6">
                    <img
                        src={VTLogoImage}
                        alt="Virginia Tech Logo"
                        className="rounded-xl bg-[#660033]"
                    />
                </figure>
                <div className="text-text-base p-6 flex flex-col gap-2 text-sm md:basis-3/4">
                    <div className="flex flex-row gap-2 items-center">
                        <IoSchool className="text-text-base w-6 h-6 hidden md:flex" />
                        <h2 className="card-title text-primary-highlight font-semibold text-xl">Bachelor's in Computer Science @ Virginia Tech</h2>
                    </div>
                    <span className="text-sm italic">2018 - Dec. 2021</span>
                    <p>
                        I graduated from Virginia Tech in December 2021 with a Bachelor's degree in Computer Science and a minor in Mathematics.
                        I graduated with a <span className="font-semibold text-primary-highlight">3.98 GPA</span> and was inducted into the
                        <a
                            href={externalRoutes.PhiBetaKappa}
                            className="font-semibold text-primary-highlight underline-offset-4 transition-all duration-400 underline hover:scale-105 inline-block origin-left px-1 hover:pr-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Phi Beta Kappa
                        </a>
                        honor society. Additionally, I received scholarships such as the <span className="font-semibold text-primary-highlight">Graduate School Talent Scholarship</span>.
                        Additionally, I worked two semesters as an undergraduate teaching assistant for a Python course.
                        <span> and the </span>
                        <span className="font-semibold text-primary-highlight">Pratt Engineering Scholarship</span>.
                    </p>
                    <span className="mt-2 font-semibold text-primary-highlight">Relevant Coursework:</span>
                    <ul className="list-disc pl-5">
                        <li>Data & Algorithm Analysis</li>
                        <li>Principles of Computer Security</li>
                        <li>Data Structures and Algorithms</li>
                        <li>Database Management Systems</li>
                        <li>Network Architecture</li>
                        <li>Artificial Intelligence</li>
                    </ul>

                </div>
            </div>
            <div id="capital-one-experience-card" className="flex flex-row bg-background-muted shadow-sm rounded-lg scroll-mt-24">
                <figure className="hidden md:flex w-full basis-1/4 justify-center items-center p-6">
                    <img
                        src={CapitalOneLogo}
                        alt="Capital One Logo"
                        className="rounded-xl"
                    />
                </figure>
                <div className="text-text-base p-6 flex flex-col gap-2 text-sm md:basis-3/4">
                    <div className="flex flex-row gap-2 items-center">
                        <FaRegBuilding className="text-text-base w-6 h-6 hidden md:flex" />
                        <h2 className="card-title text-primary-highlight font-semibold text-xl">Software Engineer Intern @ Capital One</h2>
                    </div>
                    <span className="text-sm italic">Summer 2021</span>
                    <p>
                        My second internship was at Capital One, where I built APIs using Python to allow users to request Just-in-Time access
                        to AWS resources. I gained experience working with a microservices architecture and AWS integration. There was also
                        a focus on scalability and unit testing. I was able to secure a full-time return offer as well.
                    </p>
                    <span className="mt-2 font-semibold text-primary-highlight">Key Technologies:</span>
                    <ul className="list-disc pl-5">
                        <li>Python</li>
                        <li>Microservices</li>
                        <li>API Development</li>
                        <li>AWS</li>
                    </ul>
                </div>
            </div>
            <div id="pragmatics-experience-card" className="flex flex-row bg-background-muted shadow-sm rounded-lg scroll-mt-24">
                <figure className="hidden md:flex w-full basis-1/4 justify-center items-center p-6">
                    <img
                        src={PragmaticsLogo}
                        alt="Pragmatics Logo"
                        className="rounded-xl"
                    />
                </figure>
                <div className="text-text-base p-6 flex flex-col gap-2 text-sm md:basis-3/4">
                    <div className="flex flex-row gap-2 items-center">
                        <FaRegBuilding className="text-text-base w-6 h-6 hidden md:flex" />
                        <h2 className="card-title text-primary-highlight font-semibold text-xl">Software Engineer Intern @ Pragmatics</h2>
                    </div>
                    <span className="text-sm italic">Summer 2020</span>
                    <p>
                        My first internship was with Pragmatics, a small software consulting company based in Virginia. As part of an Agile
                        team, I helped develop a web application for a government client.
                    </p>
                    <p className="mt-2 font-semibold text-primary-highlight">Key Technologies:</p>
                    <ul className="list-disc pl-5">
                        <li>AWS</li>
                        <li>Docker</li>
                        <li>Java Spring Boot</li>
                        <li>Unit Testing Frameworks</li>
                    </ul>
                </div>
            </div>
            <div id="tjhsst-experience-card" className="flex flex-row bg-background-muted shadow-sm rounded-lg scroll-mt-24">
                <figure className="hidden md:flex w-full basis-1/4 justify-center items-center p-6">
                    <img
                        src={TJLogo}
                        alt="TJHSST Logo"
                        className="rounded-xl bg-white"
                    />
                </figure>
                <div className="text-text-base p-6 flex flex-col gap-2 text-sm md:basis-3/4">
                    <div className="flex flex-row gap-2 items-center">
                        <IoSchool className="text-text-base w-6 h-6 hidden md:flex" />
                        <h2 className="card-title text-primary-highlight font-semibold text-xl">Thomas Jefferson High School for Science and Technology</h2>
                    </div>
                    <span className="text-sm italic">2014 - 2018</span>
                    <p>
                        <span>
                            I attended TJHSST from 2014 to 2018, where I developed a strong foundation in computer science and mathematics.
                            While I was there, TJ was rated the</span>
                        <a
                            href={externalRoutes.NewsweekTJRanking}
                            className="font-semibold text-primary-highlight underline-offset-4 transition-all duration-400 underline hover:scale-105 inline-block origin-left px-1 hover:pr-3"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            #1 public high school
                        </a>
                        <span>in the United States by multiple publications.</span>
                    </p>
                    <p>
                        During my time at TJ, I balanced a rigorous academic schedule with extracurricular activities,
                        especially
                        <span className="font-semibold text-primary-highlight pl-1">Varsity Football</span>
                        , where I served as captain and was awarded
                        <span className="font-semibold text-primary-highlight px-1">Most Valuable Player</span>
                        in my senior year.
                    </p>
                    <p>Some relevant classes I took include:</p>
                    <ul className="list-disc pl-5">
                        <li>Artificial Intelligence</li>
                        <li>Parallel Computing</li>
                        <li>AP Computer Science + Data Structures</li>
                        <li>Mobile + Web Development w/ Research Lab</li>
                    </ul>
                </div>
            </div>
        </div >
    );
}


const LinkButton: React.FC<{ href: string; icon: React.ReactNode }> = ({ href, icon }) => {
    return (
        <div className="rounded-xl p-2 bg-background-muted transition shadow-lg hover:scale-110 duration-500">
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-highlight transition-colors duration-500 flex items-center gap-1 justify-center"
            >
                {icon}
            </a>
        </div>

    );
}

export default AboutMe;
