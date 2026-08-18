import bcrypt from 'bcrypt';

const myPlaintextPassword = "AIUb@63can"; 

const hash = await bcrypt.hash(myPlaintextPassword, 10);

console.log("\n✅ Success! Here is your new hashed password:\n");
console.log(hash);
console.log("\nCopy that string and paste it into your .env file as ADMIN_PASSWORD_HASH.\n");