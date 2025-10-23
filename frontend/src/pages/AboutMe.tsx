import React, { useEffect, useState } from "react";
import HeadshotImage from "../assets/headshot.png";
import { FaComputer } from "react-icons/fa6";
import { IoSchool } from "react-icons/io5";
import { FaGears } from "react-icons/fa6";
import { IoCodeSlash } from "react-icons/io5";
import { LuMapPin } from "react-icons/lu";
import { IoLogoLinkedin } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { externalRoutes, pageRoutes } from "../utils/urls";
import { FadeSlideIn } from "../utils/animations";


const AboutMe = () => {
    return (
        <FadeSlideIn>
            <div className="min-h-screen flex flex-col items-center gap-6 pt-8 px-4">
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
        <div className="flex flex-row justify-between items-center px-12 text-xl text-text-base w-full max-w-lg mx-auto">
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
                        className="px-4 py-2 rounded-full bg-background-muted shadow text-base font-semibold border border-brd-muted hover:scale-110 transition-transform duration-200 select-none"
                    >
                        {skill}
                    </span>
                ))}
            </div>
            <hr className="my-4 border-brd-muted" />
        </div>
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
