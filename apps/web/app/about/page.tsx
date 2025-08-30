"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    MessageSquare, 
    Filter, 
    Zap, 
    Users, 
    Target, 
    ArrowRight,
    Mail
} from "lucide-react";
import Link from "next/link"


import { FaLinkedin, FaGithub, FaGlobe } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import image from './image.png'

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Hero Section */}
            <motion.section 
                className="container mx-auto px-4 py-20"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div variants={fadeInUp} className="mb-8">
                        <div className="relative w-64 h-64 mx-auto mb-6">
                            <Image
                                src={image}
                                alt="Sanjay Kumar - Founder Profile"
                                className="rounded-full object-cover border-4 border-white shadow-lg"
                                fill
                            />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            Meet <span className="text-blue-400">Sanjay Kumar</span>
                        </h1>
                        <p className="text-lg text-blue-300 mb-2 font-medium">
                            21-Year-Old Founder & Multi-Technology Expert
                        </p>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Building the future of intelligent message management through rule-based organization. 
                            A visionary entrepreneur passionate about VR, Biotechnology, and cutting-edge innovations 
                            that shape tomorrow's digital landscape.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Story Section */}
            <motion.section 
                className="container mx-auto px-4 py-16"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeInUp}>
                        <Card className="p-8 mb-12 border-0 shadow-xl bg-white/80 backdrop-blur">
                            <CardContent className="p-0">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">My Story</h2>
                                <div className="prose prose-lg text-gray-600 max-w-none">
                                    <p className="mb-4">
                                        As a founder deeply passionate about solving real-world problems, I witnessed firsthand 
                                        how professionals and businesses struggle with message overload across multiple platforms. 
                                        The constant switching between social media, customer care systems, and various communication 
                                        channels was not just inefficient—it was causing important messages to slip through the cracks.
                                    </p>
                                    <p className="mb-4">
                                        This pain point sparked the creation of SkylerInbox. I envisioned a solution that would 
                                        intelligently consolidate all communications into a single, powerful interface while 
                                        maintaining the granular control that users need to customize their experience.
                                    </p>
                                    <p>
                                        Today, SkylerInbox represents the culmination of cutting-edge machine learning technology 
                                        combined with intuitive design, empowering users to take control of their digital communications 
                                        like never before.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.section>

            {/* Company Mission */}
            <motion.section 
                className="bg-white py-20"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <div className="container mx-auto px-4">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                            Our Mission
                        </Badge>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Revolutionizing Digital Communication
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            SkylerInbox is an ML-powered multi-inbox container designed to filter, organize, 
                            and streamline messages from all your platforms with intelligent rule-based automation 
                            and precise manual control.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <motion.div variants={fadeInUp}>
                            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-4">Unified Inbox</h3>
                                    <p className="text-gray-600">
                                        Consolidate messages from social media, customer care, and multiple platforms 
                                        into one intelligent interface.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Filter className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-4">Smart Filtering</h3>
                                    <p className="text-gray-600">
                                        AI-powered filtering with customizable rules ensures important messages 
                                        never get lost in the noise.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Zap className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-4">Manual Control</h3>
                                    <p className="text-gray-600">
                                        Maintain full control with granular settings and manual overrides 
                                        for complete customization.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Vision & Values */}
            <motion.section 
                className="py-20 bg-gradient-to-r from-blue-600 to-purple-700"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <motion.div variants={fadeInUp}>
                            <h2 className="text-4xl font-bold mb-8">Our Vision</h2>
                            <p className="text-xl opacity-90 mb-12">
                                To create a world where digital communication enhances productivity rather than 
                                overwhelming it, where every message finds its rightful place, and where users 
                                maintain complete control over their digital interactions.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8 mt-16">
                            <div className="flex flex-col items-center">
                                <Users className="w-12 h-12 mb-4 opacity-80" />
                                <h3 className="text-lg font-semibold mb-2">User-Centric</h3>
                                <p className="text-sm opacity-75">Built for real people solving real problems</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Target className="w-12 h-12 mb-4 opacity-80" />
                                <h3 className="text-lg font-semibold mb-2">Precision</h3>
                                <p className="text-sm opacity-75">Accurate filtering with zero compromise</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Zap className="w-12 h-12 mb-4 opacity-80" />
                                <h3 className="text-lg font-semibold mb-2">Innovation</h3>
                                <p className="text-sm opacity-75">Cutting-edge AI meets intuitive design</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Contact CTA */}
            <motion.section 
                className="py-20 bg-gray-50"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.div variants={fadeInUp} className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Let's Connect
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Interested in learning more about SkylerInbox or discussing the future of 
                            digital communication? I'd love to hear from you.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Mail className="w-4 h-4 mr-2" />
                                Get in Touch
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                        <div className="flex justify-center space-x-6 mt-8">
                            <Link href="https://x.com/sky_bolt20907" target="_blank" className="text-muted-foreground hover:text-foreground">
                                <FaXTwitter size={24} />
                            </Link>
                            <Link href="https://www.linkedin.com/in/sanjay-kumar-6382a1372/" target="_blank" className="text-muted-foreground hover:text-foreground">
                                <FaLinkedin size={24} />
                            </Link>
                            <Link href="https://www.sanjaybuilds.com/" target="_blank" className="text-muted-foreground hover:text-foreground">
                                <FaGlobe size={24} />
                            </Link>
                                        <Link href="https://github.com/05sanjaykumar" target="_blank" className="text-muted-foreground hover:text-foreground">
              <FaGithub size={24} />
            </Link>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}