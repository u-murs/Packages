export { PageLayout }

import React from 'react'

import { Link } from './Link'
import logoUrl from './logo.svg'
import { PageContextProvider } from './usePageContext'

import type { PageContext } from 'vike/types'
import './css/index.css'
import './PageLayout.css'

function PageLayout({
    children,
    pageContext,
}: {
    children: React.ReactNode
    pageContext: PageContext
}): ReactNode {
    return (
        <React.StrictMode>
            <PageContextProvider pageContext={pageContext}>
                <Layout>
                    <Sidebar>
                        <Logo />
                        <Link href="/">Welcome</Link>
                        <Link href="/about">About</Link>
                        <Link href="/star-wars">Data Fetching</Link>
                    </Sidebar>
                    <Content>{children}</Content>
                </Layout>
            </PageContextProvider>
        </React.StrictMode>
    )
}

function Layout({ children }: { children: ReactNode }): ReactNode {
    return (
        <div
            style={{
                display: 'flex',
                maxWidth: 900,
                margin: 'auto',
            }}
        >
            {children}
        </div>
    )
}

function Sidebar({ children }: { children: ReactNode }): ReactNode {
    return (
        <div
            id="sidebar"
            style={{
                padding: 20,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                lineHeight: '1.8em',
                borderRight: '2px solid #eee',
            }}
        >
            {children}
        </div>
    )
}

function Content({ children }: { children: React.ReactNode }): ReactNode {
    return (
        <div id="page-container">
            <div
                id="page-content"
                style={{
                    padding: 20,
                    paddingBottom: 50,
                    minHeight: '100vh',
                }}
            >
                {children}
            </div>
        </div>
    )
}

function Logo(): ReactNode {
    return (
        <div
            style={{
                marginTop: 20,
                marginBottom: 10,
            }}
        >
            <a href="/">
                <img src={logoUrl} height={64} width={64} alt="logo" />
            </a>
        </div>
    )
}
