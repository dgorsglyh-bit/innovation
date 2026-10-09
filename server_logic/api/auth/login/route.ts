import { NextResponse } from 'next/server';
import { comparePasswords, createSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Load users from JSON
        const filePath = path.join(process.cwd(), 'src/data/users.json');
        const fileData = await fs.readFile(filePath, 'utf-8');
        const users = JSON.parse(fileData);

        const user = users.find((u: any) => u.username === username);

        if (!user || !(await comparePasswords(password, user.passwordHash))) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create session
        await createSession({
            id: user.id,
            username: user.username,
            role: user.role,
        });

        // Log the success
        const logPath = path.join(process.cwd(), 'src/data/logs.json');
        const logData = await fs.readFile(logPath, 'utf-8');
        const logs = JSON.parse(logData);
        logs.push({
            event: 'login_success',
            username: user.username,
            timestamp: new Date().toISOString(),
            ip: request.headers.get('x-forwarded-for') || 'unknown',
        });
        await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

        return NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
