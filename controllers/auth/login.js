const { supabase } = require("../../config/supabase");
// //import twilio
// const twilio = require("twilio");
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required!" });
    }

    // Step 1: Authenticate user with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;

    const userId = authData.user.id;
    const accessToken = authData.session.access_token;

    // // Step 2: Fetch additional user data from `users` table
    // const { data: userData, error: userError } = await supabase
    //   .from("users")
    //   .select("id, name, mobile_no, username, address, profile_pic_url")
    //   .eq("id", userId)
    //   .single();

    // if (userError) throw userError;

    res.status(200).json({
      message: "Login successful",
      access_token: accessToken,
      //   user: userData,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// const loginWithOtp = async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     if (!mobile) {
//       return res.status(400).json({ error: "Mobile number is required!" });
//     }

//     // Step 1: Check if the user is registered
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("mobile_no", mobile)
//       .single();

//     if (userError) throw userError;

//     if (!userData) {
//       return res.status(404).json({ error: "User not found!" });
//     }

//     // Step 2: Generate a 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     console.log(`Generated OTP for ${mobile}:`, otp); // Remove in production

//     // Step 3: Send OTP using Twilio
//     const accountSid = process.env.TWILIO_ACCOUNT_SID;
//     const authToken = process.env.TWILIO_AUTH_TOKEN;
//     const client = require("twilio")(accountSid, authToken);

//     await client.messages.create({
//       body: `Your OTP is: ${otp}`,
//       from: "+13328779759",
//       to: `${mobile}`, // Assuming mobile is Indian number without country code
//     });

//     // Step 4: Store OTP in the DB
//     const { error: otpError } = await supabase
//       .from("users")
//       .update({ otp })
//       .eq("mobile_no", mobile);

//     if (otpError) throw otpError;

//     return res.status(200).json({ message: "OTP sent successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message || "Server error" });
//   }
// };

// const verifyOtp = async (req, res) => {
//   try {
//     const { otp } = req.body;

//     if (!otp) {
//       return res.status(400).json({ error: "otp are required!" });
//     }
//     console.log(otp);
//     // Step 1: Verify OTP from the database in users table otp column
//     const { data: otpData, error: otpError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("otp", otp)
//       .single();

//     if (otpError) throw otpError;

//     // Step 2: Fetch additional user data from `users` table
//     const userId = otpData.id;
//     console.log(userId);
//     // Step 3: Get credntial from authOTP table
//     const { data: credential, error: credentialError } = await supabase
//       .from("authOTP")
//       .select("email, password")
//       .eq("user_id", userId)
//       .single();

//     if (credentialError) throw credentialError;
//     console.log(credential);
//     //login with OTP
//     const { data: authData, error: authError } =
//       await supabase.auth.signInWithPassword({
//         email: credential.email,
//         password: credential.password,
//       });

//     if (authError) throw authError;
//     console.log(authData);

//     const userid = authData.user.id;
//     const accessToken = authData.session.access_token;

//     // Step 2: Fetch additional user data from `users` table
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("id, name, mobile_no, username, address, profile_pic_url")
//       .eq("id", userid)
//       .single();

//     if (userError) throw userError;

//     res.status(200).json({
//       message: "Login successful",
//       access_token: accessToken,
//       user: userData,
//     });
//   } catch (err) {
//     res.status(401).json({ error: err });
//   }
// };

module.exports = { login };
