import {useCallback, useEffect, useRef, useState} from "react"
import ForceGraph3D, {type ForceGraphMethods} from "react-force-graph-3d"
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import * as THREE from "three"

interface Node {
    id: number;
    color: string;
    val?: number;
}

interface Link {
    source: number;
    target: number;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

const DynamicGraph = () => {
    const [data, setData] = useState<GraphData>({
        nodes: [{id: 0, color: Math.random() > 0.5 ? "red" : "blue", val: 1}],
        links: [],
    })

    const graphRef = useRef<ForceGraphMethods<Node, Link> | undefined>(undefined)

    useEffect(() => {
        // Wait for graph to be ready before adding bloom
        const timer = setTimeout(() => {
            if (graphRef.current) {
                const bloomPass = new UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    1.5,
                    0.4,
                    0.85,
                )
                bloomPass.strength = 4
                bloomPass.radius = 1
                bloomPass.threshold = 0
                graphRef.current.postProcessingComposer().addPass(bloomPass)
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            // Add a new connected node every second
            setData(({nodes, links}) => {
                const id = nodes.length
                return {
                    nodes: [
                        ...nodes,
                        {id, color: Math.random() > 0.5 ? "red" : "blue", val: 1},
                    ],
                    links: [
                        ...links,
                        {source: id, target: Math.round(Math.random() * (id - 1))},
                    ],
                }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleClick = useCallback(
        (node: Node) => {
            const {nodes, links} = data

            // Remove node on click
            const newLinks = links.filter(
                (l) => l.source !== node.id && l.target !== node.id,
            ) // Remove links attached to node
            const newNodes = nodes.filter((n) => n.id !== node.id)
            // Reset node ids to array index
            newNodes.forEach((n, idx) => {
                n.id = idx
            })

            setData({nodes: newNodes, links: newLinks})
        },
        [data],
    )

    return (
        <ForceGraph3D
            ref={graphRef}
            backgroundColor="#000003"
            enableNodeDrag={false}
            onNodeClick={handleClick}
            graphData={data}
            nodeColor="color"
            nodeOpacity={1}
            linkOpacity={0.5}
        />
    )
}

function App() {
    return (
        <div className="font-sans w-screen h-screen">
            <DynamicGraph/>
        </div>
    )
}

export default App
