const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/user");

module.exports = {
	login: async (req, res) => {
		try {
			const { email, password } = req.body;
			const data = {
				email: email,
				password: password,
			};

			if (!email || !password) {
				res.status(400).send({ message: "Email/Password can't be empty" });
			}

			const queryResult = await user.auth(data);

			if (queryResult == "") {
				res.status(401).send({ message: "Email/Password is incorrect" });
			} else {
				if (!(await bcrypt.compare(data.password, queryResult[0].password))) {
					res.status(401).send({ message: "Email/Password is incorrect" });
				} else {
					const id = queryResult[0].id;
					const jwtexp = parseInt(process.env.JWT_EXPIRES_IN);
					const token = jwt.sign(
						{
							id: id,
							exp: Date.now() + 3600 * jwtexp,
						},
						process.env.JWT_KEY
					);

					// const cookieOptions = {
					// 	expires: new Date(Date.now() + jwtexp * 24 * 60 * 60 * 1000),
					// 	httpOnly: true,
					// };
					// res.cookie("jwt", token, cookieOptions);

					res.status(200).send({ token: token });
				}
			}
		} catch (err) {
			console.log(err);
		}
	},
};
