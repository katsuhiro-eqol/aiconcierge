import { LoaderCircle } from 'lucide-react';

export default function Loading(){
    return (
        <div className="flex justify-center items-center h-screen">
            <LoaderCircle size={24} className="text-slate-500 animate-spin" />
            <p>loading...</p>
        </div>
    )
}