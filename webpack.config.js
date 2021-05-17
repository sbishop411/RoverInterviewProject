const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { ProgressPlugin } = require("webpack");

module.exports = [
	{
		entry: {
			app: path.resolve(__dirname, "src", "client", "App.tsx")
		},
		target: "web",
		resolve: {
			extensions: [".tsx", ".ts", ".json"]
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: [{
						loader: "ts-loader",
						options: {
							configFile: "./tsconfig.client.json"
						}
					}],
					exclude: /node_modules/
				}
			]
		},
		output: {
			path: path.join(__dirname, "dist", "client"),
			filename: "[name].[contenthash].js"
		},
		optimization: {
			minimize: false
		},
		plugins: [
			new ProgressPlugin(),
			new CleanWebpackPlugin(),
			new HtmlWebpackPlugin({
				template: path.join(__dirname, "src", "client", "index.html")
			})
		]
		/*
		, devServer: {
			contentBase: path.join(__dirname, "dist", "client"),
			compress: true,
			port: XXXX
		}
		*/
	}
];
