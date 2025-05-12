import { client } from "@/sanity/lib/client"
import Ping from "./Ping"
import { STARTUP_VIEWS_QUERY } from "@/sanity/lib/queries"
import { writeClient } from "@/sanity/lib/writeClient"
import { unstable_after as after } from "next/server"

const View = async ({id}: {id: string}) => {
  const { views : totalViews } = await client.withConfig({useCdn: false}).fetch(STARTUP_VIEWS_QUERY, {id});
  // setting useCdn to false ensures that we get the latest data from the server and enables ppr strategy 

  after(async () => await writeClient.patch(id).set({views: totalViews + 1}).commit()); // incrementing the views count by 1 and committing the change. The after function ensures that the code runs after the response is sent to the client

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>
      <p className="view-text">
        <span className="font-black">Views: {totalViews}</span>
      </p>
    </div>
  )
}

export default View
