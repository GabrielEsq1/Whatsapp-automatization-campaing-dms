const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating Meta Credentials...');

    const token = 'EAAUGZBLev0hgBQJlzYCsktw246haVRd9qsmJ1ZCjjmDsIIch0C9qIfkoeQu5midZAsjD9K7knFb4TO76ZCfxL8YDPyjYvlEUWOenlFEkKlblc4PGxNZCZAIH4lEDbZCDllY0NFRJs4rvcNrlr7Kq2U1CRqqDE68qQj9QVOZBNk1sRCBGaAS33N9ZCJqOi9Jb7s0ZBGnhszJyJq2WfHXsBNssKXlhS6hJ3qHCFqKMpod8D7HxdmtJB43WQPOJ3vWUWXAewxjYi0DxrHzLYdYrJ629rTtGZAsh2HJept9gwZDZD';
    const phoneId = '947423951783420';
    const wabaId = '1370303018171718';

    // Update ALL users for simplicity in this single-tenant/demo context
    const users = await prisma.user.findMany();

    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                metaAccessToken: token,
                metaPhoneId: phoneId,
                metaWabaId: wabaId,
                waStatus: 'READY' // Force status green
            }
        });
        console.log(`Updated credentials for user: ${user.email} (${user.id})`);
    }

    if (users.length === 0) {
        console.log('No users found. Creating a default admin user if possible or waiting for login.');
        // Optional: Could create a user here if needed, but authenticating usually creates one.
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
