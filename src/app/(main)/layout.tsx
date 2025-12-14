import { Sidebar } from '../components/Sidebar';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent">
            <Sidebar />

            {/* Main Content Area */}
            {/* lg:pl-64 adjusts content position for desktop sidebar */}
            <main className="lg:pl-64 min-h-screen transition-all duration-300">
                <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
