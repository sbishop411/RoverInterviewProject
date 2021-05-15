const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = [
	{
		entry: {
			app: path.join(__dirname, "src", "server", "server.ts")
		},
		target: "node",
		resolve: {
			extensions: [".ts", ".js"]
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: "ts-loader",
					exclude: /node_modules/
				}
			]
		},
		output: {
			filename: "server.js",
			path: path.resolve(__dirname, "dist")
		},
		optimization: {
			minimize: false
		}
	},
	{
		entry: {
			app: path.join(__dirname, "src", "client", "app.tsx")
		},
		target: "web",
		resolve: {
			extensions: [".tsx", ".ts", ".js"]
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/
				}
			]
		},
		output: {
			filename: "client.js",
			path: path.resolve(__dirname, "dist")
		},
		optimization: {
			minimize: false
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: path.join(__dirname, "src/client/", "index.html")
			})
		]
	}
];
