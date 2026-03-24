import Header from '../components/Header';
import Footer from '../components/Footer';

function MainLayout({ showHeader = false, showFooter = false, children }) {
    return (
        <div className="flex flex-col min-h-screen relative">
            {showHeader && <Header />}

            <main className="flex-1">
                {children}
            </main>

            {showFooter && <Footer />}
        </div>
    );
}

export default MainLayout;