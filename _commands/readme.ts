#!/usr/bin/env -S npx tsx
/* eslint-disable @typescript-eslint/no-empty-function */
import fs from 'fs'
import { writeFile } from 'fs/promises'
import path from 'path'

import args from 'args'
import { bundleMDX } from 'mdx-bundler'
import { getMDXComponent } from 'mdx-bundler/client'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import __loadSkyConfig from './__loadSkyConfig'

args.command('readme', 'Generate md from mdx with navigation', () => {})

args.parse(process.argv, {
    name: 'sky',
    mainColor: 'magenta',
    subColor: 'grey',
    mri: {},
})

process.env.NODE_ENV = 'production'

readme()

async function readme(): Promise<void> {
    const skyConfig = await __loadSkyConfig()

    if (!skyConfig) {
        return
    }

    const menu: {
        name: string
        path: string
        folder: string
        items: unknown[]
    }[] = []

    if (fs.existsSync('docs/overview')) {
        getMenu('docs/overview')
    }

    getMenu('')
    fs.writeFileSync('docs/menu.json', JSON.stringify(menu, null, '    '))

    function getMenu(folder: string, menu_ = menu): void {
        const dirs = fs.readdirSync(path.resolve(folder))

        let menuItem
        if (folder !== '') {
            for (const dir of dirs) {
                if (dir.indexOf('node_modules') !== -1) {
                    continue
                }
                if (dir.startsWith('.')) {
                    continue
                }
                if (dir.endsWith('.mdx')) {
                    menuItem = {
                        name: dir.slice(0, -4),
                        path: folder + '/' + dir.slice(0, -1),
                        folder,
                        items: [],
                    }
                    menu_.push(menuItem)
                }
            }
        }

        if (menuItem || folder === '') {
            for (const dir of dirs) {
                if (dir.indexOf('node_modules') !== -1) {
                    continue
                }
                if (dir.startsWith('.')) {
                    continue
                }

                if (fs.statSync(path.resolve(folder, dir)).isDirectory()) {
                    getMenu(
                        folder === '' ? dir : folder + '/' + dir,
                        menuItem ? menuItem.items : menu_
                    )
                }
            }
        }

        menu_.sort((a, b) => {
            if (a.name === 'Overview') {
                return -1
            }

            if (b.name === 'Overview') {
                return 1
            }

            return a.name.localeCompare(b.name)
        })
    }

    convert('').then(() => {
        // eslint-disable-next-line no-console
        console.log('Converted **/*.mdx -> **/*.mdx')
    })

    async function convert(folder: string): Promise<void> {
        const dirs = fs.readdirSync(path.resolve(folder))

        for (const dir of dirs) {
            if (dir.indexOf('node_modules') !== -1) {
                continue
            }
            if (dir.startsWith('.')) {
                continue
            }

            const currentPath = path.resolve(folder, dir)

            if (fs.statSync(currentPath).isDirectory()) {
                await convert(currentPath)
            }

            if (dir.endsWith('.mdx')) {
                // eslint-disable-next-line no-console
                console.log('Building: ' + currentPath)
                const selected = path.dirname(path.relative(process.cwd(), currentPath))
                const mdxContent = fs.readFileSync(currentPath, 'utf-8')
                const result = new NodeHtmlMarkdown().translate(
                    renderToString(
                        createElement(
                            getMDXComponent(
                                (
                                    await bundleMDX({
                                        source:
                                            "import { Nav } from 'sky/docs'\n\n" +
                                            `<Nav selected='${selected}' />\n\n` +
                                            mdxContent,
                                        cwd: path.dirname(currentPath),
                                    })
                                ).code
                            )
                        )
                    )
                )
                const banner = `This ${dir.slice(0, -4)} was auto-generated using "npx sky readme"`
                const doc = `<!--- ${banner} --> \n\n${result}`
                const targetPath = path.resolve(folder, `${dir.slice(0, -1)}`)
                await writeFile(targetPath, doc)
            }
        }
    }
}
