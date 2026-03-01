import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sun, Moon, Monitor } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'
    const [actualTheme, setActualTheme] = useState('light');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const predefinedQuestions = [
        {
            id: "overview",
            text: "Company overview",
            reply: "Cliberduche Corporation is a premier construction and responsible land development company based in the Philippines. We are committed to delivering exceptional quality, innovation, and sustainability in every project."
        },
        {
            id: "services",
            text: "Services or products",
            reply: "We are your one-stop-shop for construction and land development. We provide high-quality backfill materials for land development projects and other infrastructures. To see all our services, please visit our Services page."
        },
        {
            id: "contact",
            text: "Contact information",
            reply: "You can reach us through our digital inquiry form on the Contact Us page, where you'll also find our exact email address, mobile, and landline numbers."
        },
        {
            id: "values",
            text: "Core values",
            reply: "Our core values are Quality, Safety, and Integrity. We prioritize high-quality projects aligned with national standards, strict safety practices, and compliance with construction laws."
        },
        {
            id: "location",
            text: "Location",
            reply: "We are located in the Philippines. For our exact primary office location and a map, please visit the Contact Us page."
        },
        {
            id: "faq",
            text: "Frequently asked questions",
            reply: "Most clients ask about our services, project timelines, and estimates. We handle projects of various scales adhering to environmental regulations. Feel free to send us a message via the Contact Us page for specific details!"
        }
    ];

    // Determine actual theme based on system preference if 'system' is selected
    useEffect(() => {
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setActualTheme(prefersDark ? 'dark' : 'light');

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => setActualTheme(e.matches ? 'dark' : 'light');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            setActualTheme(theme);
        }
    }, [theme]);

    // Auto-greeting when opened for the first time
    useEffect(() => {
        if (isOpen && !hasOpened) {
            setHasOpened(true);
            setMessages([
                {
                    id: 1,
                    type: 'bot',
                    text: "Hello! Welcome to our website. How can I assist you today?"
                }
            ]);
        }
    }, [isOpen, hasOpened]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleQuestionClick = (questionText, replyText) => {
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: questionText }]);
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: replyText }]);
        }, 600);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setInputValue("");

        handleQuestionClick(userText, "Thank you for your question. A representative will get back to you shortly or you can select from our common topics below.");
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setIsDropdownOpen(false);
    };

    // Styling configurations based on theme
    const themeStyles = {
        container: actualTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100',
        header: actualTheme === 'dark' ? 'bg-blue-800 text-gray-100' : 'bg-blue-600 text-white',
        messagesArea: actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
        botMessage: actualTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 shadow-none' : 'bg-white border-gray-100 text-gray-800 shadow-sm',
        userMessage: actualTheme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white',
        optionsArea: actualTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100',
        optionText: actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500',
        optionBtn: actualTheme === 'dark' ? 'bg-gray-800 text-blue-400 border-gray-700 hover:bg-gray-700 hover:text-blue-300' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:text-blue-800',
        inputArea: actualTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
        inputField: actualTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-500 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500',
        typingDot: actualTheme === 'dark' ? 'bg-gray-500' : 'bg-gray-400',
        dropdownMenu: actualTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-100 text-gray-700',
        dropdownHover: actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
    };

    const CurrentThemeIcon = theme === 'light' ? Sun : (theme === 'dark' ? Moon : Monitor);

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className={`mb-4 w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-colors duration-300 transform origin-bottom-right ${themeStyles.container}`}>

                    {/* Header */}
                    <div className={`p-3 sm:p-4 flex justify-between items-center drop-shadow-md shrink-0 transition-colors duration-300 ${themeStyles.header}`}>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <h3 className="font-semibold text-base sm:text-lg">Support Assistant</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Theme Dropdown Toggle */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="p-1.5 rounded-full hover:bg-black/10 transition-colors flex items-center justify-center"
                                    aria-label="Toggle theme"
                                    title="Change Theme"
                                >
                                    <CurrentThemeIcon size={18} />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                        <div className={`absolute right-0 top-10 w-32 rounded-lg py-1 shadow-lg border z-20 ${themeStyles.dropdownMenu}`}>
                                            <button
                                                onClick={() => handleThemeChange('light')}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${themeStyles.dropdownHover}`}
                                            >
                                                <Sun size={14} /> Light
                                            </button>
                                            <button
                                                onClick={() => handleThemeChange('dark')}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${themeStyles.dropdownHover}`}
                                            >
                                                <Moon size={14} /> Dark
                                            </button>
                                            <button
                                                onClick={() => handleThemeChange('system')}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${themeStyles.dropdownHover}`}
                                            >
                                                <Monitor size={14} /> System
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Explicit Close Button */}
                            <button
                                onClick={toggleChat}
                                className="p-1.5 rounded-full hover:bg-black/10 transition-colors flex items-center justify-center ml-1"
                                aria-label="Close chat"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className={`flex-1 p-3 sm:p-4 min-h-[200px] overflow-y-auto flex flex-col space-y-3 sm:space-y-4 transition-colors duration-300 ${themeStyles.messagesArea}`}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`max-w-[85%] rounded-2xl p-2.5 sm:p-3 text-sm ${msg.type === 'user'
                                    ? themeStyles.userMessage + ' self-end rounded-br-sm'
                                    : themeStyles.botMessage + ' self-start rounded-bl-sm border'
                                    } animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {isTyping && (
                            <div className={`${themeStyles.botMessage} rounded-2xl p-3 w-16 self-start rounded-bl-sm flex space-x-1 items-center justify-center border transition-colors`}>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${themeStyles.typingDot}`} style={{ animationDelay: '0ms' }}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${themeStyles.typingDot}`} style={{ animationDelay: '150ms' }}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${themeStyles.typingDot}`} style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Predefined Topics (Optional) */}
                    <div className={`p-2 sm:p-3 border-t max-h-24 sm:max-h-32 overflow-y-auto shrink-0 transition-colors duration-300 ${themeStyles.optionsArea}`}>
                        <p className={`text-[10px] sm:text-xs mb-1.5 sm:mb-2 px-1 ${themeStyles.optionText}`}>Optional topics:</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {predefinedQuestions.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => handleQuestionClick(q.text, q.reply)}
                                    className={`text-[10px] sm:text-xs border px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors text-left ${themeStyles.optionBtn}`}
                                >
                                    {q.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Input Form */}
                    <form onSubmit={handleSendMessage} className={`p-2 sm:p-3 border-t flex items-center gap-2 shrink-0 transition-colors duration-300 ${themeStyles.inputArea}`}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className={`flex-1 border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${themeStyles.inputField}`}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex flex-shrink-0"
                            aria-label="Send message"
                        >
                            <Send size={16} className="translate-x-[1px] sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={toggleChat}
                className={`flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-300 ml-auto ${isOpen ? 'scale-0 opacity-0 absolute pointer-events-none' : 'scale-100 opacity-100 relative'}`}
                aria-label="Open chat"
            >
                <MessageCircle size={28} />
            </button>
        </div>
    );
};

export default Chatbot;
