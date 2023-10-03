/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

module.exports = function Fc({ types }) {
    return {
        visitor: {
            CallExpression(path) {
                if (
                    path.node.callee.name === 'Fc' &&
                    path.node.arguments &&
                    path.node.arguments.length > 0 &&
                    path.node.arguments[0].type === 'FunctionExpression'
                ) {
                    handleFc(types, path)
                }
            },
        },
    }
}

function handleFc(t, path) {
    const properties = []
    const methods = []

    path.traverse({
        CallExpression(path) {
            if (path.node.callee.type !== 'MemberExpression') {
                return
            }

            if (
                path.node.callee.object.name !== 'Fc' ||
                path.node.callee.property.name !== 'public'
            ) {
                return
            }

            path.node.arguments.forEach(arg => {
                if (arg.type === 'Identifier') {
                    methods.push(arg.name)
                } else if (arg.type === 'ObjectExpression') {
                    arg.properties.forEach(property => properties.push(property.key.name))
                }
            })
        },
    })

    path.get('arguments')[0]
        .get('body')
        .pushContainer(
            'body',
            t.returnStatement(
                t.arrayExpression([
                    t.objectExpression([
                        ...properties.map(property =>
                            t.objectMethod(
                                'get',
                                t.identifier(property),
                                [],
                                t.blockStatement([t.returnStatement(t.identifier(property))])
                            )
                        ),
                        ...properties.map(property =>
                            t.objectMethod(
                                'set',
                                t.identifier(property),
                                [t.identifier(`_${property}`)],
                                t.blockStatement([
                                    t.expressionStatement(
                                        t.assignmentExpression(
                                            '=',
                                            t.identifier(property),
                                            t.identifier(`_${property}`)
                                        )
                                    ),
                                ])
                            )
                        ),
                    ]),
                    t.objectExpression(
                        methods.map(method =>
                            t.objectProperty(t.identifier(method), t.identifier(method))
                        )
                    ),
                ])
            )
        )
}
