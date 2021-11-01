import { createClient } from "@supabase/supabase-js"
import { writable } from "svelte/store"

const supabase = createClient(
  "https://rntidcyilmxescqtmwww.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNTU4MDMwMCwiZXhwIjoxOTUxMTU2MzAwfQ._ylJn_-3ONGFN6ZUGFiy9zVyBh5KPitBv0F0XNQ-73U"
)

export default {
  polls: {
    async get(key) {
      const { body, error } = await supabase
        .from("poll")
        .select(
          `
          key,
          name,
          start_at,
          end_at,
          poll_option (
            id,
            name,
            count
          )
        `
        )
        .eq("key", key)
        .single()

      if (error) {
        console.error(error)
      }

      return body
    },

    async upvote(key, options) {
      await Promise.all(
        options.map(async (option: any) => {
          const { id, name, count } = option
          if (!name || !count) {
            return console.error("Invalid input")
          }

          const { data: upvoteData, error: upvoteError } = await supabase.rpc("upvote", {
            key,
            option_id: id,
            increment_count: count,
          })
          console.log({ upvoteError, upvoteData })

          return
        })
      )

      try {
        const { body, error } = await supabase
          .from("poll")
          .select(
            `
            key,
            name,
            start_at,
            end_at,
            poll_option (
              id,
              name,
              count
            )
          `
          )
          .eq("key", key)
          .single()

        if (error) {
          return console.error(error.message)
        }

        if (!body) {
          return console.error("Not Found")
        }

        return body
      } catch (error) {
        return console.error((error as Error).message)
      }
    },
  },
}
