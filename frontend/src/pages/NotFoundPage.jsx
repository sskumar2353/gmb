import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
export default function NotFoundPage() { return <Layout><div className="text-center"><h1 className="text-3xl">404</h1><Link to="/"><Button>Back Home</Button></Link></div></Layout>; }