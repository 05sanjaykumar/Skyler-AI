import React from 'react';

const DocsPage = () => {
    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>Documentation</h1>
            <p>Welcome to the documentation page. Here you will find all the information you need to get started.</p>
            <section>
                <h2>Getting Started</h2>
                <p>Follow the steps below to set up the project:</p>
                <ol>
                    <li>Clone the repository.</li>
                    <li>Install dependencies using <code>npm install</code> or <code>yarn install</code>.</li>
                    <li>Run the development server with <code>npm run dev</code> or <code>yarn dev</code>.</li>
                </ol>
            </section>
            <section>
                <h2>Features</h2>
                <ul>
                    <li>Feature 1: Description of feature 1.</li>
                    <li>Feature 2: Description of feature 2.</li>
                    <li>Feature 3: Description of feature 3.</li>
                </ul>
            </section>
            <footer style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
                <p>&copy; {new Date().getFullYear()} Skyler AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DocsPage;