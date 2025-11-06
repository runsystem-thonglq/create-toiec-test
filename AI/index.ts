// import { GoogleGenerativeAI } from "@google/generative-ai";
// import fs from "fs";
// console.log(process.env.GOOGLE_API_KEY);
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// // Đọc file PDF vào buffer
// const file = fs.readFileSync("./data/a.pdf");

// // Đọc prompt từ file promt.md
// const prompt = fs.readFileSync("./promt/create-part5.md", "utf-8");

// // Gửi file lên Gemini với prompt từ promt.md
// const result = await model.generateContent([
//   {
//     inlineData: { data: file.toString("base64"), mimeType: "application/pdf" },
//   },
//   { text: prompt },
// ]);

// console.log(result.response.text());
