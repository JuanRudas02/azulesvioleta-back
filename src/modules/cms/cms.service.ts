import { prisma } from '../../prisma/prisma.service';

export class CmsService {
    async getHomeContent() {
        const configs = await prisma.systemConfig.findMany({
            where: {
                key: { in: ['HERO_TITLE', 'HERO_SUBTITLE', 'BENEFITS_SECTION'] },
            },
        });

        // Formatting as an object mapping keys to values
        const response = configs.reduce((acc: Record<string, string>, current: any) => {
            acc[current.key] = current.value;
            return acc;
        }, {} as Record<string, string>);

        return response;
    }

    async updateHomeContent(data: Record<string, string>) {
        const updates = [];

        for (const [key, value] of Object.entries(data)) {
            updates.push(
                prisma.systemConfig.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) },
                })
            );
        }

        await prisma.$transaction(updates);

        return this.getHomeContent();
    }
}
