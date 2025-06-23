export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-800 hover:dark:bg-blue-500 text-white py-2 px-4 rounded-full"
      {...props}
    />
  );
}
