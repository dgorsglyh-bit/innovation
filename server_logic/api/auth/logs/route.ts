import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    const session = await getSession();
    
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const filePath = path.join(process.cwd(), 'src/data/logs.json');
        const fileData = await fs.readFile(filePath, 'utf-8');
        const logs = JSON.parse(fileData);
        
        // Return last 50 logs, sorted by timestamp descending
        const sortedLogs = logs.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 50);

        return NextResponse.json(sortedLogs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
