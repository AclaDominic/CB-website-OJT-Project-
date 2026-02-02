<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Illuminate\Http\Request;

class PageContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PageContent::query();

        if ($request->has('page')) {
            $query->where('page_name', $request->query('page'));
        }

        $contents = $query->get();

        // Secure filtering for public users
        if (!$request->user('sanctum')) {
            $contents->transform(function ($item) {
                if ($item->page_name === 'contact' && $item->section_name === 'office_info') {
                    try {
                        $data = json_decode($item->content, true);
                        if (is_array($data)) {
                            // Filter Email
                            if (isset($data['email']) && is_array($data['email']) && isset($data['email']['visible']) && !$data['email']['visible']) {
                                $data['email']['value'] = ''; // Redact value
                            }
                            // Filter Mobile
                            if (isset($data['mobile']) && is_array($data['mobile']) && isset($data['mobile']['visible']) && !$data['mobile']['visible']) {
                                $data['mobile']['value'] = ''; // Redact value
                            }
                            // Filter Landline
                            if (isset($data['landline']) && is_array($data['landline']) && isset($data['landline']['visible']) && !$data['landline']['visible']) {
                                $data['landline']['value'] = ''; // Redact value
                            }
                            // Filter Socials
                            if (isset($data['socials']) && is_array($data['socials'])) {
                                $data['socials'] = array_filter($data['socials'], function ($social) {
                                    return isset($social['visible']) && $social['visible'];
                                });
                                $data['socials'] = array_values($data['socials']); // Re-index array
                            }

                            $item->content = json_encode($data);
                        }
                    } catch (\Exception $e) {
                        // Keep original content if parsing fails
                    }
                }
                return $item;
            });
        }

        return $contents;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'page_name' => 'required|string',
            'section_name' => 'required|string',
            'content' => 'required',
        ]);

        $content = PageContent::updateOrCreate(
            [
                'page_name' => $validated['page_name'],
                'section_name' => $validated['section_name']
            ],
            ['content' => $validated['content']]
        );

        return response()->json($content);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return PageContent::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $content = PageContent::findOrFail($id);
        $content->update($request->all());
        return response()->json($content);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        PageContent::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}
